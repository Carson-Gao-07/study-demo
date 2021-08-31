// 对响应式对象进行拦截处理
function defineReactive(obj, key, val) {
  // 递归处理对象嵌套
  observe(val)

  // 为响应式属性key创建dep
  const dep = new Dep()

  // 属性拦截
  Object.defineProperty(obj, key, {
    get() {
      // 真正的依赖收集在这里，会建立key对应的watcher和dep的关系
      // 这里的Dep.target实际上是一个watcher
      Dep.target && dep.addDep(Dep.target)
      return val
    },
    set(newVal) {
      if (newVal !== val) {
        observe(newVal)
        val = newVal

        // 通知更新
        dep.notify()
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

// 给实例中的data做一层代理，直接挂到vm实例下，可通过this访问
function proxy(vm) {
  if (vm.$data instanceof Function) {
    vm.$data = vm.$data()
  }
  Object.keys(vm.$data).forEach((key) => {
    Object.defineProperty(vm, key, {
      get() {
        return vm.$data[key]
      },
      set(val) {
        observe(val)
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

    // 如果组件的data是函数，则需要先执行拿到返回值
    if (this.$data instanceof Function) {
      this.$data = this.$data()
    }
    // 2.做响应式处理
    observe(this.$data)

    // 2.5 给data中的key做一层代理，直接挂到vm下面
    proxy(this)

    // 3.模版编译
    new Compile(options.el, this)
  }
}

class Compile {
  constructor(el, vm) {
    // 保存实例
    this.$vm = vm

    // 获取宿主元素
    const dom = document.querySelector(el)

    // 开始编译
    this.compiler(dom)
  }

  compiler(el) {
    // console.log(el.childNodes)
    // 遍历宿主的所有节点
    const childNodes = el.childNodes
    childNodes.forEach((node) => {
      if (this.isElement(node)) {
        // 节点为元素
        // console.log("编译元素", node.nodeName)
        // 依次解析节点的属性，指令，事件等
        const attrs = node.attributes
        Array.from(attrs).forEach((attr) => {
          const attrName = attr.name
          const exp = attr.value
          if (this.isDir(attrName)) {
            const dir = attrName.substring(2)
            // 判断是否为合法指令，如果是则执行指令解析函数
            this[dir] && this[dir](node, exp)
          }
        })
        // 节点还有子节点，需要向下递归
        if (node.childNodes.length > 0) {
          this.compiler(node)
        }
      } else if (this.isInter(node)) {
        // 插值表达式
        // console.log("编译插值表达式", node.textContent)
        this.compileText(node)
      }
    })
  }

  // 处理所有的动态绑定
  // 参数dir为指令的名称
  update(node, exp, dir) {
    //1.初始化
    const fn = this[dir + "Updater"]
    fn && fn(node, this.$vm[exp])

    // 创建watcher实例，负责后续更新
    new Watcher(this.$vm, exp, function(val) {
      fn && fn(node, val)
    })
  }

  // c-text
  text(node, exp) {
    this.update(node, exp, "text")
  }
  // c-text指令更新函数
  textUpdater(node, val) {
    node.textContent = val
  }

  // c-html
  html(node, exp) {
    this.update(node, exp, "html")
  }
  // c-html指令更新函数
  htmlUpdater(node, val) {
    node.innerHTML = val
  }

  // 解析插值表达式
  compileText(node) {
    // console.log(this.$vm[RegExp.$1])
    this.update(node, RegExp.$1, "text")
    // node.textContent = this.$vm[RegExp.$1]
  }

  // 判断节点是否为元素
  isElement(node) {
    return node.nodeType === 1
  }

  // 判断节点是否为插值表达式
  isInter(node) {
    return node.nodeType === 3 && /\{\{(.*)\}\}/.test(node.textContent)
  }

  // 判断是否为动态指令
  isDir(attrName) {
    return attrName.startsWith("c-")
  }
}

// 负责具体节点的更新
class Watcher {
  constructor(vm, key, updater) {
    this.vm = vm
    this.key = key
    this.updater = updater

    // 先保存一下this
    Dep.target = this

    // 读一下key的值，使其建立Dep和Watcher的关系
    this.vm[this.key]

    //将Dep.target的值置为空
    Dep.target = null
  }

  // 将来Dep会调用watcher的更新函数
  update() {
    const val = this.vm[this.key]
    this.updater.call(this.vm, val)
  }
}

// Dep和响应式属性key之间有一一对应关系
// 负责通知对应的watcher更新
class Dep {
  constructor() {
    // 创建依赖管理
    this.deps = []
  }

  // 依赖收集
  addDep(dep) {
    this.deps.push(dep)
  }

  // 通知更新
  notify() {
    this.deps.forEach((dep) => dep.update())
  }
}
