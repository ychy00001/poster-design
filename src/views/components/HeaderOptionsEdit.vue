<!--
 * @Author: ShawnPhang
 * @Date: 2022-01-12 11:26:53
 * @Description: 顶部操作按钮组
 * @LastEditors: ShawnPhang <https://m.palxp.cn>
 * @LastEditTime: 2023-12-11 12:40:59
-->
<template>
  <div class="top-title"><el-input v-model="title" placeholder="未命名的设计" class="input-wrap" /></div>
  <div class="top-icon-wrap">
    <template v-if="tempEditing">
      <span style="color: #999; font-size: 14px; margin-right: 0.5rem">{{ stateBollean ? '启用' : '停用' }}</span> <el-switch v-model="stateBollean" @change="stateChange" />
      <div class="divide__line">|</div>
      <el-button plain type="primary" @click="saveTemp">保存模板</el-button>
      <el-button @click="$store.commit('managerEdit', false)">取消</el-button>
      <div class="divide__line">|</div>
    </template>
    <!-- <el-button @click="draw">绘制(测试)</el-button> -->
    <el-button :loading="loading" size="large" class="primary-btn" :disabled="tempEditing" @click="save(true)">保存</el-button>
    <copyRight>
      <el-button :loading="loading" size="large" class="primary-btn" :disabled="tempEditing" plain type="primary" @click="download">下载作品</el-button>
    </copyRight>
  </div>
  <!-- 生成图片组件 -->
  <SaveImage ref="canvasImage" />
</template>

<script lang="ts">
import api from '@/api'
import { defineComponent, reactive, toRefs, getCurrentInstance, ComponentInternalInstance } from 'vue'
import { mapGetters, mapActions, useStore } from 'vuex'
import { useRoute, useRouter } from 'vue-router'
import _dl from '@/common/methods/download'
import useNotification from '@/common/methods/notification'
import SaveImage from '@/components/business/save-download/CreateCoverEdit.vue'
import { useFontStore } from '@/common/methods/fonts'
import copyRight from './CopyRight.vue'
import _config from '@/config'
import useConfirm from '@/common/methods/confirm'
import wGroup from '@/components/modules/widgets/wGroup/wGroup.vue'

export default defineComponent({
  components: { copyRight, SaveImage },
  props: ['modelValue'],
  emits: ['change', 'update:modelValue'],
  setup(props, context) {
    const { proxy }: any = getCurrentInstance() as ComponentInternalInstance
    const route = useRoute()
    const router = useRouter()
    const store = useStore()
    const state = reactive({
      stateBollean: false,
      title: '',
      loading: false,
      bizName: '',
      keyword: '',
      templateId: -1,
    })

    // 保存作品
    async function save(hasCover: boolean = false) {
      if (state.loading === true) {
        return
      }
      state.loading = true
      // Bugs: 历史操作有问题，且page操作未及时入栈 proxy?.dPageHistory
      if (proxy?.dHistory.length <= 0) {
        state.loading = false
        return
      }
      store.commit('setShowMoveable', false) // 清理掉上一次的选择框
      // console.log(proxy?.dPage, proxy?.dWidgets)
      const { id, tempid } = route.query

      context.emit('update:modelValue', true)
      context.emit('change', { downloadPercent: 1, downloadText: '正在生成封面' })

      let timerCount = 0
      const animation = setInterval(() => {
        if (props.modelValue && timerCount < 75) {
          timerCount += RandomNumber(1, 10)
          context.emit('change', { downloadPercent: 1 + timerCount, downloadText: '正在合成图片' })
        } else {
          clearInterval(animation)
        }
      }, 800)
      const cover = hasCover ? await proxy?.draw() : undefined
      clearInterval(animation)
      console.log("generateCover:", cover)
      const widgets = proxy.dWidgets // reviseData()
      context.emit('change', { downloadPercent: 75, downloadText: '正在提交保存' })
      const updateResult = await api.poster.update({ id, 
          title: proxy.title || '未命名设计', 
          bizName: proxy.bizName,
          keyword: proxy.dKeyword,
          templateId: proxy.templateId, 
          cover, 
          data: JSON.stringify({ page: proxy.dPage, widgets }), 
          width: proxy.dPage.width, 
          height: proxy.dPage.height,
          status: 1
      })
      context.emit('change', { downloadPercent: 100, downloadText: '保存完成' })

      if(!updateResult.code){
        useNotification('保存成功', '可在"我的作品"中查看')
      }else{
        useNotification('保存失败', updateResult.msg, { type: 'error' })
      }
      state.loading = false
      !id && router.push({ path: '/edit', query: { id: id }, replace: true })
      store.commit('setShowMoveable', true)
    }
    // 保存模板
    async function saveTemp() {
      const { tempid, tempType: type } = route.query
      let res = null
      if (type == 1) {
        // 保存组件，组合元素要保证在最后一位，才能默认选中
        if (proxy.dWidgets[0].type === 'w-group') {
          const group = proxy.dWidgets.shift()
          group.record.width = 0
          group.record.height = 0
          proxy.dWidgets.push(group)
        }
        // TODO：如果保存组件不存在组合，则添加组合。该功能待优化
        if (!proxy.dWidgets.some((x) => x.type === 'w-group')) {
          alert('提交组件必须为组合！')
          return
          // proxy.dWidgets.push(wGroup.setting)
        }
        res = await api.home.saveTemp({ id: tempid, type, title: proxy.title || '未命名组件', content: JSON.stringify(proxy.dWidgets), width: proxy.dPage.width, height: proxy.dPage.height })
      } else res = await api.home.saveTemp({ id: tempid, title: proxy.title || '未命名模板', content: JSON.stringify({ page: proxy.dPage, widgets: proxy.dWidgets }), width: proxy.dPage.width, height: proxy.dPage.height })
      res.stat != 0 && useNotification('保存成功', '模板内容已变更')
    }
    // 停用启用
    async function stateChange(e: any) {
      const { tempid, tempType: type } = route.query
      const { stat } = await api.home.saveTemp({ id: tempid, type, state: e ? 1 : 0 })
      stat != 0 && useNotification('保存成功', '模板内容已变更')
    }
    async function download() {
      if (state.loading === true) {
        return
      }
      // 临时提示
      if (proxy.title === '自设计模板') {
        const isPass = await useConfirm('提示', 'PSD自设计作品暂时保存在Github，下载可能失败', 'warning')
        if (!isPass) {
          return
        }
      }
      state.loading = true
      context.emit('update:modelValue', true)
      context.emit('change', { downloadPercent: 1, downloadText: '正在处理封面' })
      await save(true)
      setTimeout(async () => {
        const { id } = route.query
        if (id) {
          const { width, height } = proxy.dPage
          context.emit('update:modelValue', true)
          context.emit('change', { downloadPercent: 1, downloadText: '准备合成图片' })
          state.loading = false
          let timerCount = 0
          const animation = setInterval(() => {
            if (props.modelValue && timerCount < 75) {
              timerCount += RandomNumber(1, 10)
              context.emit('change', { downloadPercent: 1 + timerCount, downloadText: '正在合成图片' })
            } else {
              clearInterval(animation)
            }
          }, 800)
          await _dl.downloadImg(api.home.download_cw({ id, width, height }) + '&r=' + Math.random(), (progress: number, xhr: any) => {
            if (props.modelValue) {
              clearInterval(animation)
              progress >= timerCount && context.emit('change', { downloadPercent: Number(progress.toFixed(0)), downloadText: '图片生成中' })
            } else {
              xhr.abort()
            }
          })
          context.emit('change', { downloadPercent: 100, downloadText: '图片下载中' })
        }
      }, 100)
    }
    function RandomNumber(min: number, max: number) {
      return Math.ceil(Math.random() * (max - min)) + min
    }

    return {
      ...toRefs(state),
      download,
      save,
      saveTemp,
      stateChange,
    }
  },
  computed: {
    ...mapGetters(['dKeyword', 'dPage', 'dWidgets', 'tempEditing', 'dHistory', 'dPageHistory']),
  },
  methods: {
    ...mapActions(['setDKeyword', 'pushHistory', 'addGroup']),
    async load(id: any, tempId: any, type: any, cb: Function) {
      if (this.$route.name !== 'Draw') {
        await useFontStore.init() // 初始化加载字体
      }
      const apiName = tempId && !id ? 'template' : 'poster'
      if (!id && !tempId) {
        cb()
        return
      }
      const { data: content, title, state, width, height, bizName, keyword, templateId   } = await api[apiName].get({ id: id || tempId})
      if (content) {
        const data = JSON.parse(content)
        this.stateBollean = !!state
        this.title = title
        this.bizName = bizName
        this.$store.commit('setDKeyword', keyword) 
        this.templateId = templateId
        this.$store.commit('setShowMoveable', false) // 清理掉上一次的选择框
        // this.$store.commit('setDWidgets', [])
        if (type == 1) {
          // 加载文字组合组件
          this.dPage.width = width
          this.dPage.height = height
          this.addGroup(data)
        } else {
          this.$store.commit('setDPage', data.page)
          id ? this.$store.commit('setDWidgets', data.widgets) : this.$store.dispatch('setTemplate', data.widgets)
        }
        cb()
        this.pushHistory('请求加载load')
      }
    },
    draw() {
      return new Promise((resolve) => {
        this.$refs.canvasImage.createCover((imgUrl:any) => {
          console.log("drawImgUrl:" , imgUrl)
          resolve(imgUrl)
        })
      })
    },
  },
})
</script>

<style lang="less" scoped>
.top-icon-wrap {
  display: flex;
  align-items: center;
  padding-right: 20px;
  height: 54px;
  .top-icon {
    background-color: rgba(0, 0, 0, 0.4);
    border-radius: 5px;
    color: #ffffff;
    cursor: pointer;
    font-weight: bold;
    margin: 8px;
    padding: 5px 8px;
    &:hover {
      background-color: rgba(0, 0, 0, 0.5);
    }
  }
}
.top-title {
  color: @color-black;
  flex: 1;
  padding-left: 88px;
  // font-weight: bold;
  .input-wrap {
    width: 15rem;
    :deep(input) {
      border-color: #ffffff;
      // border-color: #e8eaec;
    }
  }
  .input-wrap:hover {
    :deep(input) {
      border-color: #e8eaec;
    }
  }
}
.primary-btn {
  font-weight: 600;
  transform: scale(0.95);
  margin-left: 10px;
}

.divide__line {
  margin: 0 1rem;
  color: #e8eaec;
  height: 20px;
}
</style>