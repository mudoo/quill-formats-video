import Quill from 'quill'
const EmbedBlot = Quill.import('blots/embed')

const BOOLEAN_ATTRS = ['muted', 'autoplay', 'playsinline', 'webkit-playsinline', 'loop']

function sanitize (url, protocols) {
  try {
    const protocol = new URL(url).protocol.slice(0, -1)
    return protocols.includes(protocol)
  } catch {
    return false
  }
}

function getEventName (name) {
  name = name.slice(2)
  return name.slice(0, 1).toLowerCase() + name.slice(1)
}

class Video extends EmbedBlot {
  static blotName = 'video'
  static className = 'ql-video'
  static tagName = 'VIDEO'
  static IGNORE_ATTRS = ['src', 'class', 'style']
  static PROTOCOL_WHITELIST = ['http', 'https', 'ftp']

  static create (value) {
    const node = super.create()
    if (typeof value === 'string') {
      value = {
        src: value
      }
    }
    const attrs = Object.assign({
      'webkit-playsinline': true,
      playsinline: true,
      controls: true
    }, value)

    BOOLEAN_ATTRS.forEach(attr => {
      if (attrs[attr] != null) {
        attrs[attr] = !!attrs[attr]
      }
    })

    Object.keys(attrs).forEach(key => {
      let value = attrs[key]
      if (key === 'src') value = this.sanitize(value)
      if (key.slice(0, 2) === 'on') {
        node.addEventListener(getEventName(key), value)
      } else {
        node.setAttribute(key, value)
      }
    })

    return node
  }

  static formats (domNode) {
    const attrs = {}
    for (const attr of domNode.attributes) {
      if (this.IGNORE_ATTRS.includes(attr.name)) continue
      attrs[attr.name] = attr.value
    }
    return attrs
  }

  static sanitize (url) {
    return sanitize(url, this.PROTOCOL_WHITELIST) ? url : '//:0'
  }

  static value (node) {
    return node.getAttribute('src')
  }

  format (name, value) {
    this.domNode.setAttribute(name, value || name)
  }
}

export default Video
