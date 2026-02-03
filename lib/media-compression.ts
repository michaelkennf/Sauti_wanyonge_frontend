/**
 * Utilitaires de compression des médias (images, vidéos, audio)
 * Compression sans perte de qualité visible
 */

export interface CompressionOptions {
  maxWidth?: number
  maxHeight?: number
  quality?: number // 0-1 pour images
  maxSizeMB?: number // Taille maximale en MB
}

/**
 * Compresse une image sans perte de qualité visible
 */
export async function compressImage(
  file: File,
  options: CompressionOptions = {}
): Promise<File> {
  const {
    maxWidth = 1920,
    maxHeight = 1080,
    quality = 0.85,
    maxSizeMB = 5
  } = options

  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    
    reader.onload = (e) => {
      const img = new Image()
      
      img.onload = () => {
        // Calculer les nouvelles dimensions en conservant le ratio
        let width = img.width
        let height = img.height
        
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height)
          width = width * ratio
          height = height * ratio
        }
        
        // Créer un canvas pour redimensionner
        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height
        
        const ctx = canvas.getContext('2d')
        if (!ctx) {
          reject(new Error('Impossible de créer le contexte canvas'))
          return
        }
        
        // Dessiner l'image redimensionnée
        ctx.drawImage(img, 0, 0, width, height)
        
        // Convertir en blob avec compression
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Erreur lors de la compression'))
              return
            }
            
            // Vérifier la taille
            const sizeMB = blob.size / (1024 * 1024)
            if (sizeMB > maxSizeMB) {
              // Réduire encore la qualité si nécessaire
              const newQuality = Math.max(0.5, quality * (maxSizeMB / sizeMB))
              canvas.toBlob(
                (finalBlob) => {
                  if (!finalBlob) {
                    reject(new Error('Erreur lors de la compression finale'))
                    return
                  }
                  const compressedFile = new File(
                    [finalBlob],
                    file.name,
                    { type: 'image/jpeg' }
                  )
                  resolve(compressedFile)
                },
                'image/jpeg',
                newQuality
              )
            } else {
              const compressedFile = new File(
                [blob],
                file.name,
                { type: 'image/jpeg' }
              )
              resolve(compressedFile)
            }
          },
          'image/jpeg',
          quality
        )
      }
      
      img.onerror = () => reject(new Error('Erreur lors du chargement de l\'image'))
      img.src = e.target?.result as string
    }
    
    reader.onerror = () => reject(new Error('Erreur lors de la lecture du fichier'))
    reader.readAsDataURL(file)
  })
}

/**
 * Compresse une vidéo en réduisant le bitrate tout en gardant une bonne qualité
 * Utilise MediaRecorder avec un bitrate réduit pour re-encoder la vidéo
 */
export async function compressVideo(
  file: File,
  options: CompressionOptions = {}
): Promise<File> {
  const maxSizeMB = options.maxSizeMB || 50
  
  // Si le fichier est déjà petit, pas besoin de compression
  const sizeMB = file.size / (1024 * 1024)
  if (sizeMB <= maxSizeMB) {
    return file
  }
  
  return new Promise((resolve, reject) => {
    const video = document.createElement('video')
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    
    if (!ctx) {
      reject(new Error('Impossible de créer le contexte canvas'))
      return
    }
    
    video.preload = 'metadata'
    
    video.onloadedmetadata = () => {
      // Calculer les nouvelles dimensions (max 1280x720 pour réduire la taille)
      let width = video.videoWidth
      let height = video.videoHeight
      const maxWidth = options.maxWidth || 1280
      const maxHeight = options.maxHeight || 720
      
      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height)
        width = Math.floor(width * ratio)
        height = Math.floor(height * ratio)
      }
      
      canvas.width = width
      canvas.height = height
      
      // Créer un stream depuis le canvas
      const stream = canvas.captureStream(30) // 30 FPS
      
      // Bitrate adaptatif selon la taille cible
      // Pour 35s à 5MB max : ~1.14 Mbps nécessaire
      // On utilise 1.5 Mbps pour garder une excellente qualité
      const targetBitrate = Math.min(1500000, Math.floor((maxSizeMB * 8 * 1024 * 1024) / 35))
      
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'video/webm;codecs=vp9', // VP9 pour meilleure compression
        videoBitsPerSecond: targetBitrate
      })
      
      const chunks: Blob[] = []
      
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunks.push(e.data)
        }
      }
      
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' })
        const finalSizeMB = blob.size / (1024 * 1024)
        
        // Si toujours trop gros, réessayer avec bitrate plus bas
        if (finalSizeMB > maxSizeMB && targetBitrate > 800000) {
          const newBitrate = Math.floor(targetBitrate * 0.7) // Réduire de 30%
          const retryRecorder = new MediaRecorder(stream, {
            mimeType: 'video/webm;codecs=vp9',
            videoBitsPerSecond: newBitrate
          })
          
          const retryChunks: Blob[] = []
          retryRecorder.ondataavailable = (e) => {
            if (e.data.size > 0) {
              retryChunks.push(e.data)
            }
          }
          
          retryRecorder.onstop = () => {
            const finalBlob = new Blob(retryChunks, { type: 'video/webm' })
            const compressedFile = new File(
              [finalBlob],
              file.name.replace(/\.[^/.]+$/, '.webm'),
              { type: 'video/webm' }
            )
            resolve(compressedFile)
          }
          
          video.currentTime = 0
          video.play()
          retryRecorder.start()
          
          const drawFrame = () => {
            if (video.currentTime >= video.duration) {
              retryRecorder.stop()
              video.pause()
            } else {
              ctx.drawImage(video, 0, 0, width, height)
              requestAnimationFrame(drawFrame)
            }
          }
          drawFrame()
        } else {
          const compressedFile = new File(
            [blob],
            file.name.replace(/\.[^/.]+$/, '.webm'),
            { type: 'video/webm' }
          )
          resolve(compressedFile)
        }
      }
      
      video.currentTime = 0
      video.play()
      mediaRecorder.start()
      
      const drawFrame = () => {
        if (video.currentTime >= video.duration) {
          mediaRecorder.stop()
          video.pause()
        } else {
          ctx.drawImage(video, 0, 0, width, height)
          requestAnimationFrame(drawFrame)
        }
      }
      drawFrame()
    }
    
    video.onerror = () => reject(new Error('Erreur lors du chargement de la vidéo'))
    video.src = URL.createObjectURL(file)
  })
}

/**
 * Compresse un fichier audio en réduisant le bitrate tout en gardant une excellente qualité
 * Utilise MediaRecorder avec Opus codec pour une compression efficace
 */
export async function compressAudio(
  file: File,
  options: CompressionOptions = {}
): Promise<File> {
  const maxSizeMB = options.maxSizeMB || 10
  
  // Si le fichier est déjà petit, pas besoin de compression
  const sizeMB = file.size / (1024 * 1024)
  if (sizeMB <= maxSizeMB) {
    return file
  }
  
  return new Promise((resolve, reject) => {
    const audio = new Audio()
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
    
    audio.preload = 'auto'
    
    audio.onloadeddata = async () => {
      try {
        // Charger le fichier audio
        const arrayBuffer = await file.arrayBuffer()
        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer)
        
        // Créer un MediaStream depuis l'audio
        const source = audioContext.createBufferSource()
        source.buffer = audioBuffer
        const destination = audioContext.createMediaStreamDestination()
        source.connect(destination)
        
        // Bitrate adaptatif : 96 kbps pour excellente qualité voix
        // Pour 60s à 1MB max : ~133 kbps nécessaire, on utilise 96 kbps pour qualité optimale
        const targetBitrate = Math.min(96000, Math.floor((maxSizeMB * 8 * 1024 * 1024) / audioBuffer.duration))
        
        const mediaRecorder = new MediaRecorder(destination.stream, {
          mimeType: 'audio/webm;codecs=opus',
          audioBitsPerSecond: targetBitrate
        })
        
        const chunks: Blob[] = []
        
        mediaRecorder.ondataavailable = (e) => {
          if (e.data.size > 0) {
            chunks.push(e.data)
          }
        }
        
        mediaRecorder.onstop = () => {
          const blob = new Blob(chunks, { type: 'audio/webm' })
          const finalSizeMB = blob.size / (1024 * 1024)
          
          // Si toujours trop gros, réessayer avec bitrate plus bas
          if (finalSizeMB > maxSizeMB && targetBitrate > 64000) {
            const newBitrate = Math.floor(targetBitrate * 0.8) // Réduire de 20%
            const retryRecorder = new MediaRecorder(destination.stream, {
              mimeType: 'audio/webm;codecs=opus',
              audioBitsPerSecond: newBitrate
            })
            
            const retryChunks: Blob[] = []
            retryRecorder.ondataavailable = (e) => {
              if (e.data.size > 0) {
                retryChunks.push(e.data)
              }
            }
            
            retryRecorder.onstop = () => {
              const finalBlob = new Blob(retryChunks, { type: 'audio/webm' })
              const compressedFile = new File(
                [finalBlob],
                file.name.replace(/\.[^/.]+$/, '.webm'),
                { type: 'audio/webm' }
              )
              resolve(compressedFile)
            }
            
            source.start()
            retryRecorder.start()
            setTimeout(() => {
              retryRecorder.stop()
              source.stop()
            }, audioBuffer.duration * 1000)
          } else {
            const compressedFile = new File(
              [blob],
              file.name.replace(/\.[^/.]+$/, '.webm'),
              { type: 'audio/webm' }
            )
            resolve(compressedFile)
          }
        }
        
        source.start()
        mediaRecorder.start()
        setTimeout(() => {
          mediaRecorder.stop()
          source.stop()
        }, audioBuffer.duration * 1000)
      } catch (error) {
        console.error('Erreur compression audio:', error)
        // En cas d'erreur, retourner le fichier original
        resolve(file)
      }
    }
    
    audio.onerror = () => {
      // En cas d'erreur, retourner le fichier original
      resolve(file)
    }
    audio.src = URL.createObjectURL(file)
  })
}

/**
 * Compresse automatiquement un fichier selon son type
 */
export async function compressMediaFile(
  file: File,
  options: CompressionOptions = {}
): Promise<File> {
  if (file.type.startsWith('image/')) {
    return compressImage(file, options)
  } else if (file.type.startsWith('video/')) {
    return compressVideo(file, options)
  } else if (file.type.startsWith('audio/')) {
    return compressAudio(file, options)
  }
  
  // Pour les autres types de fichiers, retourner tel quel
  return file
}

/**
 * Compresse plusieurs fichiers en parallèle
 */
export async function compressMediaFiles(
  files: File[],
  options: CompressionOptions = {}
): Promise<File[]> {
  return Promise.all(
    files.map(file => compressMediaFile(file, options))
  )
}
