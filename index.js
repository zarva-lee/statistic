import browserEvent from './lib/browserEvent'
import browserTiming from './lib/browserTiming'
import behavior from './lib/behavior'
import activeTime from './lib/activeTime'
import config from './lib/config'
import getPageInfo from './lib/pageInfo'
import storage from './lib/storage'
import Event from './lib/Event'
import clientInfo from './lib/client'
import md5 from 'blueimp-md5'

export default class Statistic extends Event {
  constructor(autoPv = true) {
    super()
    this.autoPv = autoPv
    this._init()
  }

  _init() {
    activeTime.init()
    behavior.init()

    this.$emit('init', this)

    browserEvent.create(window, 'load', () => {
      this.autoPv && this.$emit('windowLoad', getPageInfo())
      this.$emit('clientInfo', clientInfo)
      setTimeout(() => {
        this.$emit('browserTiming', browserTiming())
      }, 5E3)
    })
    browserEvent.create(window, 'unload', () => {
      storage.setData(config.namespaces + '_pai_' + config.appId, config.pageId, true)
      this.autoPv && this.$emit('windowUnload', Object.assign(behavior.getBehavior(), activeTime.getActiveTime()))
    })
  }

  pageStart() {
    activeTime.clearNoUse()
    config.pageId = md5(config.appId + window.location.href)
    config.pvStartTime = new Date().valueOf()
    this.$emit('pageStart', getPageInfo())
  }

  pageClose() {
    storage.setData(config.namespaces + '_pai_' + config.appId, config.pageId, true)
    config.parentPageId = config.pageId
    this.$emit('pageClose', Object.assign(behavior.getUserBehavior(), activeTime.getUserActiveTime()))
  }

  userEvent(postData) {
    this.$emit('userEvent', postData)
  }

}
