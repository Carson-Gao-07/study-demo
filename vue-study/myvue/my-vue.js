function defineReactive(obj, key, val) {
  // 递归处理对象嵌套
  observe(val)

  // 属性拦截
  Object.defineProperty(obj, key, {
    get() {
      return val
    },
    set(newVal) {
      if (newVal !== val) {
        observe(newVal)
        val = newVal
      }
    },
  })
}

function observe(obj) {
  if (typeof obj !== "object" || obj == null) {
    return obj
  }

  // 遍历用户传入的对象，进行响应式处理
  Object.keys(obj).forEach((key) => {
    defineReactive(obj, key, obj[key])
  })
}

function proxy(vm) {
  Object.keys(vm).forEach((key) => {
    Object.defineProperty(vm, key, {
      get() {
        return vm.$data[key]
      },
      set(val) {
        observe(newVal)
        vm.$data[key] = val
      },
    })
  })
}

class CVue {
  constructor(options) {
    // 1.保存选项
    this.$options = options
    this.$data = options.data

    // 2.做响应式处理
    // 2.5 给data中的key做一层代理，直接挂到vm下面
    if (this.$data instanceof Function) {
      observe(this.$data())
      proxy(this.$data())
    } else {
      observe(this.$data)
      proxy(this.$data)
    }

    // 3.模版编译
  }
}
