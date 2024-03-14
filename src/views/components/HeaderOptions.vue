<!--
 * @Author: ShawnPhang
 * @Date: 2022-01-12 11:26:53
 * @Description: 顶部操作按钮组
 * @LastEditors: ShawnPhang <https://m.palxp.cn>
 * @LastEditTime: 2024-03-11 01:43:30
-->
<template>
  <div class="top-title"><el-input v-model="inputTitle" placeholder="未命名的设计" class="input-wrap" /></div>
  <div class="top-icon-wrap">
    <template v-if="tempEditing">
      <!-- <span style="color: #999; font-size: 14px; margin-right: 0.5rem">{{ state.stateVar ? '启用' : '停用' }}</span> <el-switch v-model="state.stateVar" @change="stateChange" /> -->
      <div class="divide__line">|</div>
      <el-button  plain type="primary" @click="saveTemp">保存模板1111</el-button>
      <el-button @click="$store.commit('managerEdit', false)">取消</el-button>
      <div class="divide__line">|</div>
    </template>
    <!-- <el-button @click="draw">绘制(测试)</el-button> -->
    <el-button v-if="dEditTemplateId && dEditTemplateId > 0" :loading="loading" size="large" class="primary-btn" :disabled="tempEditing" @click="saveTemp(false, true)">保存模板</el-button>
    <el-button v-if="dEditTemplateId && dEditTemplateId > 0" :loading="loading" size="large" class="primary-btn" :disabled="tempEditing" @click="saveTemp(true, true)">另存模板</el-button>
    <el-button v-else :loading="loading" size="large" class="primary-btn" :disabled="tempEditing" @click="saveTemp(true,true)">保存模版</el-button>
    <copyRight>
      <el-button :loading="state.loading" size="large" class="primary-btn" :disabled="tempEditing" plain type="primary" @click="download">下载作品</el-button>
    </copyRight>
  </div>
  <!-- 生成图片组件 -->
  <SaveImage ref="canvasImage" />
</template>

<script lang="ts" setup>
import api from '@/api'
import { reactive, toRefs, ref ,computed, onMounted} from 'vue'
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
import { useSetupMapGetters } from '@/common/hooks/mapGetters'

type TProps = {
  modelValue?: boolean
}

type TEmits = {
  (event: 'change', data: {downloadPercent: number, downloadText: string}): void
  (event: 'update:modelValue', data: boolean): void
}

type TState= {
  stateVar: number,
  title: string,
  loading: boolean,
}

const props = defineProps<TProps>()
const emit = defineEmits<TEmits>()
const route = useRoute()
const router = useRouter()
const store = useStore()
const canvasImage = ref<typeof SaveImage | null>(null)
const {
  dTitle, dBizName, dKeyword, dEditTemplateId, dPage, dWidgets, tempEditing, dHistory, dPageHistory
} = useSetupMapGetters(['dTitle', 'dBizName', 'dKeyword', 'dEditTemplateId','dPage', 'dWidgets', 'tempEditing', 'dHistory', 'dPageHistory'])

const state = reactive<TState>({
  stateVar: 0,
  title: '',
  loading: false,
})

onMounted(() => {
  const { tempid, tempType: type } = route.query
  store.commit('setDEditTemplateId', tempid)
  console.log(dEditTemplateId)
})

const inputTitle = computed({
  get(){
    return dTitle.value
  },
  set(value){
    store.commit('setDTitle', value)
  }
})

// 保存作品
async function save(hasCover: boolean = false) {
  // Bugs: 历史操作有问题，且page操作未及时入栈 proxy?.dPageHistory
  if (dHistory.value.length <= 0) {
    return
  }
  store.commit('setShowMoveable', false) // 清理掉上一次的选择框
  // console.log(proxy?.dPage, proxy?.dWidgets)
  const { id, tempid } = route.query
  const cover = hasCover ? await draw() : undefined
  const widgets = dWidgets.value // reviseData()
  const { id: newId, stat, msg } = await api.home.saveWorks({ cover, id, title: state.title || '未命名设计', data: JSON.stringify({ page: dPage.value, widgets }), temp_id: tempid, width: dPage.value.width, height: dPage.value.height })
  stat !== 0 ? useNotification('保存成功', '可在"我的作品"中查看') : useNotification('保存失败', msg, { type: 'error' })
  !id && router.push({ path: '/home', query: { id: newId }, replace: true })
  store.commit('setShowMoveable', true)
}

// 保存模板
async function saveTemp(isCreate:boolean, showProcess: boolean) {
  const { tempid, tempType: type } = route.query
  let res = null
  if (Number(type) == 1) {
    // 保存组件，组合元素要保证在最后一位，才能默认选中
    if (dWidgets.value[0].type === 'w-group') {
      const group = dWidgets.value.shift()
      group.record.width = 0
      group.record.height = 0
      dWidgets.value.push(group)
    }
    // TODO：如果保存组件不存在组合，则添加组合。该功能待优化
    if (!dWidgets.value.some((x: Record<string, any>) => x.type === 'w-group')) {
      alert('提交组件必须为组合！')
      return
      // proxy.dWidgets.push(wGroup.setting)
    }
    res = await api.home.saveTemp({ id: tempid, type, title: state.title || '未命名组件', content: JSON.stringify(dWidgets.value), width: dPage.value.width, height: dPage.value.height })
  } else {
    if(showProcess){
      emit('update:modelValue', true)
      emit('change', { downloadPercent: 1, downloadText: '正在生成封面' })
    }

    let timerCount = 0
    const animation = setInterval(() => {
      if (props.modelValue && timerCount < 75) {
        timerCount += RandomNumber(1, 10)
        if(showProcess){
          emit('change', { downloadPercent: 1 + timerCount, downloadText: '正在合成图片' })
        }
      } else {
        clearInterval(animation)
      }
    }, 800)
    const cover = await draw()
    console.log("update_cover:" + cover)
    if(showProcess){
      clearInterval(animation)
      emit('change', { downloadPercent: 75, downloadText: '正在提交保存' })
    }
    if(dEditTemplateId.value > 0 && !isCreate){
      res = await api.template.update(
      {
        id: dEditTemplateId.value,
        title: dTitle.value || '未命名模板',
        bizName: dBizName.value,
        keyword: dKeyword.value,
        cover: cover,
        data: JSON.stringify({ page: dPage.value, widgets: dWidgets.value }),
        width: dPage.value.width,
        height: dPage.value.height,
        status: 1
      })
    }else{
      res = await api.template.create(
      {
          title: dTitle.value || '未命名模板',
          bizName: dBizName.value,
          keyword: dKeyword.value,
          cover: cover,
          data: JSON.stringify({ page: dPage.value, widgets: dWidgets.value }),
          width: dPage.value.width,
          height: dPage.value.height,
          status: 1
      })
      if (!res.code){
        store.commit('setDEditTemplateId', res)
        router.push({ path: '/design', query: { tempid: res }, replace: true })
      }
    }
    if(showProcess){
      emit('change', { downloadPercent: 100, downloadText: '保存完成' })
      setTimeout(() => {
        emit('change', { downloadPercent: 0, downloadText: '保存完成' })
    }, 1000)
    }
  }
  res.stat != 0 && useNotification('保存成功', '模板内容已变更')
}
// 停用启用
async function stateChange(e: string | number | boolean) {
  const { tempid, tempType: type } = route.query
  const { stat } = await api.home.saveTemp({ id: tempid, type, state: e ? 1 : 0 })
  stat != 0 && useNotification('保存成功', '模板内容已变更')
}

async function download() {
  if (state.loading === true) {
    return
  }
  // 临时提示
  if (state.title === '自设计模板') {
    const isPass = await useConfirm('提示', 'PSD自设计作品暂时保存在Github，下载可能失败', 'warning')
    if (!isPass) {
      return
    }
  }
  state.loading = true
  emit('update:modelValue', true)
  emit('change', { downloadPercent: 1, downloadText: '正在处理封面' })
  if(dEditTemplateId.value){
    await saveTemp(false, false)
  }else{
    await saveTemp(true, false)
  }
  setTimeout(async () => {
    const { tempid } = route.query
    if (tempid) {
      const { width, height } = dPage.value
      emit('update:modelValue', true)
      emit('change', { downloadPercent: 1, downloadText: '准备合成图片' })
      state.loading = false
      let timerCount = 0
      const animation = setInterval(() => {
        if (props.modelValue && timerCount < 75) {
          timerCount += RandomNumber(1, 10)
          emit('change', { downloadPercent: 1 + timerCount, downloadText: '正在合成图片' })
        } else {
          clearInterval(animation)
        }
      }, 800)
      await _dl.downloadImg(api.home.download_cw_template({ tempid, width, height }) + '&r=' + Math.random(), (progress: number, xhr: any) => {
        if (props.modelValue) {
          clearInterval(animation)
          progress >= timerCount && emit('change', { downloadPercent: Number(progress.toFixed(0)), downloadText: '图片生成中' })
        } else {
          xhr.abort()
        }
      })
      emit('change', { downloadPercent: 100, downloadText: '图片下载中' })
      setTimeout(() => {
        emit('change', { downloadPercent: 0, downloadText: '保存完成' })
      }, 1000)
    }
  }, 100)
}

function RandomNumber(min: number, max: number) {
  return Math.ceil(Math.random() * (max - min)) + min
}

async function load(id: number, tempId: number, type: number, cb: () => void) {
  if (route.name !== 'Draw') {
    await useFontStore.init() // 初始化加载字体
  }
  if(tempId){
    store.commit('setDEditTemplateId', tempId)
  }
  const apiName = tempId && !id ? 'template' : 'poster'
  if (!id && !tempId) {
    cb()
    return
  }
  const { data: content, title, status, width, height, bizName, keyword  } = await api[apiName].get({ id: id || tempId})
  if (content) {
    const data = JSON.parse(content)
    state.stateVar = status
    state.title = title
    store.commit('setDTitle', title)
    store.commit('setDBizName', bizName)
    store.commit('setDKeyword', keyword)
    store.commit('setShowMoveable', false) // 清理掉上一次的选择框
    if (type == 1) {
      // 加载文字组合组件
      dPage.value.width = width
      dPage.value.height = height
      store.dispatch('addGroup', data)
    } else {
      store.commit('setDPage', data.page)
      id ? store.commit('setDWidgets', data.widgets) : store.dispatch('setTemplate', data.widgets)
    }
    cb()
    store.dispatch('pushHistory', '请求加载load')
  }
}

function draw() {
  return new Promise((resolve) => {
    if (!canvasImage.value) resolve('')
    else {
      canvasImage.value.createCover((imgUrl:string) => {
        resolve(imgUrl)
      })
    }
  })
}

defineExpose({
  inputTitle,
  download,
  save,
  saveTemp,
  stateChange,
  load,
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
