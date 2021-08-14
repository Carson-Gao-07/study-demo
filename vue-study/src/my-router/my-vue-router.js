// 保存Vue全局变量
let Vue

class MyVueRouter {
  constructor(options) {
    // 保存new VueRouter()时传进来的options
    this.$options = options
    // 使用Vue提供的api使current变成为一个响应式属性
    Vue.util.defineReactive(this, "current", window.location.hash.slice(1) || "/")
    // this.current = window.location.hash.slice(1) || "/"
    window.addEventListener("hashchange", () => {
      this.current = window.location.hash.slice(1)
    })
  }
}

// 实现静态方法install
MyVueRouter.install = function(_Vue, options) {
  Vue = _Vue
  console.log(options)
  // 注册$router属性
  // 此时Vue的实例还未生成，需要延迟执行
  Vue.mixin({
    beforeCreate() {
      if (this.$options.router) Vue.prototype.$router = this.$options.router
    },
  })

  // 声明2个全局组件 1.router-link 2.router-view
  Vue.component("router-link", {
    props: {
      to: {
        type: String,
        required: true,
      },
    },
    render(h) {
      // <a herf="#/about">xxx</a>
      return h("a", { attrs: { href: `#${this.to}` } }, this.$slots.default)
    },
  })
  Vue.component("router-view", {
    render(h) {
      // 1.获取hash部分 #/about
      // console.log(window.location.hash)
      // 2.根据上面地址回去对应的组件配置 About
      // console.log(this.$router.$options)
      // console.log(this.$router.current)
      // 3.h(About)
      let component = null
      const route = this.$router.$options.routes.find((route) => {
        return route.path === this.$router.current
      })
      // console.log(route, 123)
      if (route) {
        component = route.component
      }
      return h(component)
    },
  })
}
export default MyVueRouter
