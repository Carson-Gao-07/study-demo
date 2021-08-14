// 简版Vuex手写实现

// 保存Vue全局变量
let Vue

class Store {
  constructor(options) {
    // 使store的state里面的属性变成响应式属性
    // 1.vue提供的响应式api
    // Vue.util.defineReactive(this,'state',options.state)
    // 2.借鸡生蛋
    this._vm = new Vue({
      data() {
        return {
          // 加上$$的目的是为了不让Vue做代理，避免被用户直接操作
          $$state: options.state,
        }
      },
    })

    // 提前存储用户所写的mutations和actions
    this._mutations = options.mutations
    this._actions = options.actions

    // 为了dispatch时this不丢，提前在此保存一下
    this.commit = this.commit.bind(this)
    this.dispatch = this.dispatch.bind(this)
  }

  // 暴露state属性给用户使用
  get state() {
    return this._vm._data.$$state
  }

  set state(val) {
    console.error("不能直接修改state，如需修改，请使用replaceState")
  }

  commit(type, payload) {
    const mutation = this._mutations[type]
    if (!mutation) {
      console.error("error mutation name")
      return
    }
    mutation(this.state, payload)
  }

  dispatch(type, payload) {
    const action = this._actions[type]
    if (!action) {
      console.error("error action name")
      return
    }
    action(this, payload)
  }
}

function install(_Vue) {
  Vue = _Vue

  // 注册$store属性
  Vue.mixin({
    beforeCreate() {
      if (this.$options.store) {
        Vue.prototype.$store = this.$options.store
      }
    },
  })
}

export default { Store, install }
