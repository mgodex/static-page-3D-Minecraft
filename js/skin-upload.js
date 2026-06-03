(function () {
  'use strict'

  var STORAGE_KEY = 'mc3d_skin'
  var SKIN_STYLE_ID = 'dynamic-skin'

  var fileInput = document.createElement('input')
  fileInput.type = 'file'
  fileInput.accept = 'image/png'
  fileInput.style.display = 'none'

  var wrapper = document.createElement('div')
  wrapper.className = 'SkinToggle'

  var downSvg = '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 15 12 9 18 15"/></svg>'
  var upSvg   = '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>'

  var toggleBtn = document.createElement('button')
  toggleBtn.className = 'SkinToggle-btn'
  toggleBtn.innerHTML = downSvg

  var menu = document.createElement('div')
  menu.className = 'SkinToggle-menu'

  var overlay = document.createElement('div')
  overlay.className = 'SkinOverlay'
  var modalBox = document.createElement('div')
  modalBox.className = 'SkinModal'
  var dropZone = document.createElement('div')
  dropZone.className = 'SkinDropZone'
  dropZone.innerHTML = '<div class="SkinDropZone-icon">+</div><div class="SkinDropZone-text">点击选择文件 或 拖入 PNG 皮肤</div>'
  var linkLine = document.createElement('a')
  linkLine.className = 'SkinModal-link'
  linkLine.textContent = '推荐皮肤下载网站：https://www.minecraftskins.com/'
  linkLine.href = 'https://www.minecraftskins.com/'
  linkLine.target = '_blank'

  modalBox.appendChild(dropZone)
  modalBox.appendChild(linkLine)
  overlay.appendChild(modalBox)
  document.body.appendChild(overlay)

  var uploadBtn = document.createElement('button')
  uploadBtn.className = 'SkinToggle-item'
  uploadBtn.textContent = '上传皮肤'
  uploadBtn.addEventListener('click', function () {
    closeMenu()
    overlay.classList.add('is-open')
  })

  overlay.addEventListener('click', function () {
    overlay.classList.remove('is-open')
  })
  modalBox.addEventListener('click', function (e) {
    e.stopPropagation()
  })
  dropZone.addEventListener('click', function () {
    fileInput.click()
  })

  dropZone.addEventListener('dragover', function (e) {
    e.preventDefault()
    dropZone.classList.add('is-dragover')
  })
  dropZone.addEventListener('dragleave', function () {
    dropZone.classList.remove('is-dragover')
  })
  dropZone.addEventListener('drop', function (e) {
    e.preventDefault()
    dropZone.classList.remove('is-dragover')
    var file = e.dataTransfer.files[0]
    if (file) processFile(file)
  })

  var resetBtn = document.createElement('button')
  resetBtn.className = 'SkinToggle-item SkinToggle-item--reset'
  resetBtn.textContent = '重置皮肤'
  resetBtn.addEventListener('click', function () {
    localStorage.removeItem(STORAGE_KEY)
    var s = document.getElementById(SKIN_STYLE_ID)
    if (s) s.remove()
    closeMenu()
  })

  var linkHome = document.createElement('button')
  linkHome.className = 'SkinToggle-item'
  linkHome.textContent = '作者主页'
  linkHome.addEventListener('click', function () {
    window.open('https://www.meng.me', '_blank')
    closeMenu()
  })

  var linkGithub = document.createElement('button')
  linkGithub.className = 'SkinToggle-item'
  linkGithub.textContent = 'Github'
  linkGithub.addEventListener('click', function () {
    window.open('https://github.com/mgodex', '_blank')
    closeMenu()
  })

  var divider = document.createElement('div')
  divider.className = 'SkinToggle-divider'

  menu.appendChild(uploadBtn)
  menu.appendChild(resetBtn)
  menu.appendChild(divider)
  menu.appendChild(linkHome)
  menu.appendChild(linkGithub)
  wrapper.appendChild(toggleBtn)
  wrapper.appendChild(menu)
  document.body.appendChild(wrapper)
  document.body.appendChild(fileInput)

  var isOpen = false

  function closeMenu() {
    isOpen = false
    wrapper.classList.remove('is-open')
  }

  toggleBtn.addEventListener('click', function (e) {
    e.stopPropagation()
    isOpen = !isOpen
    wrapper.classList.toggle('is-open', isOpen)
    toggleBtn.innerHTML = isOpen ? upSvg : downSvg
  })

  document.addEventListener('click', function () {
    if (isOpen) closeMenu()
  })

  function processFile(file) {
    var img = new Image()
    img.onload = function () {
      if (img.width !== 64 || img.height !== 64) {
        alert('请上传 64×64 的 Minecraft 皮肤 PNG')
        return
      }
      var dataUrl = convertSkin(img)
      localStorage.setItem(STORAGE_KEY, dataUrl)
      applySkin(dataUrl)
      overlay.classList.remove('is-open')
      fileInput.value = ''
    }
    img.src = URL.createObjectURL(file)
  }

  fileInput.addEventListener('change', function () {
    var file = fileInput.files[0]
    if (!file) return
    processFile(file)
  })

  var saved = localStorage.getItem(STORAGE_KEY)
  if (saved) applySkin(saved)

  function convertSkin(img) {
    var srcC = document.createElement('canvas')
    srcC.width = 64
    srcC.height = 64
    var srcX = srcC.getContext('2d')
    srcX.imageSmoothingEnabled = false
    srcX.drawImage(img, 0, 0)

    var dstC = document.createElement('canvas')
    dstC.width = 640
    dstC.height = 320
    var dstX = dstC.getContext('2d')
    dstX.imageSmoothingEnabled = false

    function c(sx, sy, sw, sh, dx, dy) {
      dstX.drawImage(srcC, sx, sy, sw, sh, dx, dy, sw * 10, sh * 10)
    }

    // Head
    c(8, 0, 8, 8, 80, 0)
    c(16, 0, 8, 8, 160, 0)
    c(0, 8, 8, 8, 0, 80)
    c(8, 8, 8, 8, 80, 80)
    c(16, 8, 8, 8, 160, 80)
    c(24, 8, 8, 8, 240, 80)

    // Torso
    c(20, 16, 8, 4, 200, 160)
    c(28, 16, 8, 4, 280, 160)
    c(16, 20, 4, 12, 160, 200)
    c(20, 20, 8, 12, 200, 200)
    c(28, 20, 4, 12, 280, 200)
    c(32, 20, 8, 12, 320, 200)

    // Left leg
    c(4, 16, 4, 4, 40, 160)
    c(8, 16, 4, 4, 80, 160)
    c(0, 20, 4, 12, 0, 200)
    c(4, 20, 4, 12, 40, 200)
    c(8, 20, 4, 12, 80, 200)
    c(12, 20, 4, 12, 120, 200)

    // Left arm
    c(44, 16, 4, 4, 440, 160)
    c(48, 16, 4, 4, 480, 160)
    c(40, 20, 4, 12, 400, 200)
    c(44, 20, 4, 12, 440, 200)
    c(48, 20, 4, 12, 480, 200)
    c(52, 20, 4, 12, 520, 200)

    return dstC.toDataURL('image/png')
  }

  function applySkin(dataUrl) {
    var existing = document.getElementById(SKIN_STYLE_ID)
    if (existing) existing.remove()
    var style = document.createElement('style')
    style.id = SKIN_STYLE_ID
    style.textContent = '.u-bg { background-image: url("' + dataUrl + '") !important; }'
    document.head.appendChild(style)
  }
})()
