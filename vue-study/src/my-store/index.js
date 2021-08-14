import Vue from "vue"
import Vuex from "./my-vuex"

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    count: 1,
  },
  mutations: {
    addCount(state) {
      state.count++
    },
  },
  actions: {
    asyncAddCount({ commit }) {
      setTimeout(() => {
        commit("addCount")
      }, 1000)
    },
  },
  modules: {},
})
