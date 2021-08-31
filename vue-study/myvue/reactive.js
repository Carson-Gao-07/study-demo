// 对响应式对象进行拦截处理
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

// 避免用户手动设置响应式处理
function observe(obj) {
  if (typeof obj !== "object" || obj == null) {
    return obj
  }

  // 遍历用户传入的对象，进行响应式处理
  Object.keys(obj).forEach((key) => {
    defineReactive(obj, key, obj[key])
  })
}
