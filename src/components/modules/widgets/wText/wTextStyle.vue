<template>
  <div id="w-text-style">
    <el-collapse v-model="activeNames">
      <el-collapse-item title="位置尺寸" name="1">
        <div class="line-layout">
          <number-input v-model="innerElement.left" label="X" @finish="(value) => finish('left', value)" />
          <number-input v-model="innerElement.top" label="Y" @finish="(value) => finish('top', value)" />
          <number-input v-model="innerElement.width" style="margin-top: 0.5rem" label="宽" :editable="true" @finish="(value) => finish('width', value)" />
          <number-input v-model="innerElement.height" style="margin-top: 0.5rem" label="高" :editable="true" @finish="(value) => finish('height', value)" />
        </div>
      </el-collapse-item>
      <!-- <el-collapse-item title="样式设置" name="2"> -->
      <div class="line-layout style-item">
        <value-select v-model="innerElement.fontClass" label="文字" :data="fontClassList" inputWidth="152px" :readonly="true" @finish="(font) => finish('fontClass', font)" />
        <value-select v-model="innerElement.fontSize" label="大小" suffix="px" :data="fontSizeList" @finish="(value) => finish('fontSize', value)" />
      </div>

      <icon-item-select class="style-item" :data="styleIconList1" @finish="textStyleAction" />
      <icon-item-select class="style-item" :data="styleIconList2" @finish="textStyleAction" />

      <!-- <div style="flex-wrap: nowrap" class="line-layout style-item">
        <value-select v-model="innerElement.lineHeight" label="行距" suffix="倍" :data="lineHeightList" @finish="(value) => finish('lineHeight', value)" />
        <value-select v-model="innerElement.letterSpacing" label="字距" suffix="%" :data="letterSpacingList" @finish="(value) => finish('letterSpacing', value)" />
      </div> -->
      <!-- <el-collapse-item title="位置尺寸" name="1"> -->
      <div class="style-item slide-wrap">
        <number-slider v-model="innerElement.letterSpacing" style="font-size: 14px" label="字距" labelWidth="40px" :step="0.05" :minValue="-innerElement.fontSize" :maxValue="innerElement.fontSize * 2" @finish="(value) => finish('letterSpacing', value)" />
        <number-slider v-model="innerElement.lineHeight" style="font-size: 14px" label="行距" labelWidth="40px" :step="0.05" :minValue="0" :maxValue="2.5" @finish="(value) => finish('lineHeight', value)" />
      </div>
      <!-- </el-collapse-item> -->

      <div style="flex-wrap: nowrap" class="line-layout style-item">
        <color-select v-model="innerElement.color" label="颜色" @finish="(value) => finish('color', value)" />
        <!-- <color-select v-model="innerElement.backgroundColor" label="背景颜色" @finish="(value) => finish('backgroundColor', value)" /> -->
      </div>
      <div class="line-layout style-item">
        <effect-wrap v-model="innerElement.textEffects" :data="innerElement" :degree="innerElement.degree" @select="selectTextEffect" />
      </div>
      <icon-item-select class="style-item" :data="layerIconList" @finish="layerAction" />
      <icon-item-select class="style-item" :data="alignIconList" @finish="alignAction" />

      <!-- v-show="!innerElement.editable"  -->
      <div style="margin-top: 10px" class="line-layout style-item">
        <toggle-switch v-model="innerElement.isAI" label="AI填充" @finish="(value) => finish('isAI', value)" />
        <text-input-area v-model="innerElement.text" @finish="(value) => finish('text', value)" />
      </div>
      <!-- </el-collapse-item> -->
    </el-collapse>
  </div>
</template>

<script lang="ts">
// 文本组件样式
const NAME = 'w-text-style'
import { defineComponent, reactive, toRefs, computed, watch, nextTick, onMounted } from 'vue'
import { useStore } from 'vuex'
import { useRoute } from 'vue-router'
import { styleIconList1, styleIconList2, alignIconList } from '@/assets/data/TextIconsData'
import layerIconList from '@/assets/data/LayerIconList'
import numberInput from '../../settings/numberInput.vue'
import numberSlider from '../../settings/numberSlider.vue'
import toggleSwitch from '../../settings/toggleSwitch.vue'
import colorSelect from '../../settings/colorSelect.vue'
import iconItemSelect from '../../settings/iconItemSelect.vue'
import textInputArea from '../../settings/textInputArea.vue'
import valueSelect from '../../settings/valueSelect.vue'
import effectWrap from '../../settings/EffectSelect/TextWrap.vue'
import { useFontStore } from '@/common/methods/fonts'
import usePageFontsFilter from './pageFontsFilter.ts'

export default defineComponent({
  name: NAME,
    components: { toggleSwitch, numberInput, colorSelect, iconItemSelect, textInputArea, valueSelect, effectWrap, numberSlider },
    setup() {
      const store = useStore()
      const route = useRoute()
      const state = reactive({
        activeNames: [],
        innerElement: {},
        tag: false,
        ingoreKeys: ['left', 'top', 'name', 'width', 'height', 'text', 'color', 'backgroundColor'],
        fontSizeList: [12, 14, 24, 26, 28, 30, 36, 48, 60, 72, 96, 108, 120, 140, 180, 200, 250, 300, 400, 500],
        fontClassList: [], // 不能设空字体系统默认字体，因为截图服务的默认字体无法保证一致
        lineHeightList: [1, 1.5, 2],
        letterSpacingList: [0, 10, 25, 50, 75, 100, 200],
        layerIconList,
        styleIconList1,
        styleIconList2,
        alignIconList,
      })
      const dActiveElement = computed(() => store.getters.dActiveElement)
      const dMoving = computed(() => store.getters.dMoving)
      const isDesign = computed(() => route.name === 'Design')

      watch(() => dActiveElement.value, () => {
        change()
      }, { deep: true })

      watch(() => state.innerElement, () => {
        changeValue()
      }, { deep: true })

      let timer: any = null

      onMounted(() => {
        change()
        setTimeout(() => {
          loadFonts()
        }, 100)
      })

      function change() {
        if (timer) {
          return
        }
        timer = true
        setTimeout(() => {
          timer = null
        }, 300)
        state.tag = true
        state.innerElement = JSON.parse(JSON.stringify(dActiveElement.value))
        changeStyleIconList()
      }

      function changeValue() {
        if (state.tag) {
          state.tag = false
          return
        }
        if (dMoving.value) {
          return
        }
        // TODO 修改数值
        for (let key in state.innerElement) {
          if (state.ingoreKeys.indexOf(key) !== -1) {
            dActiveElement.value[key] = state.innerElement[key]
          } else if (key !== 'setting' && key !== 'record' && state.innerElement[key] !== dActiveElement.value[key]) {
            // const pushHistory = !['textEffects', 'transformData', 'fontClass'].includes(key)
            store.dispatch('updateWidgetData', {
              uuid: dActiveElement.value.uuid,
              key,
              value: state.innerElement[key],
              pushHistory: false,
            })
          }
        }
      }

      function selectTextEffect({ key, value, style }: any) {
        const uuid = dActiveElement.value.uuid
        store.commit('setWidgetStyle', { uuid, key, value })
        if (style) {
          finish('color', style.color || '')
        }
      }

      function loadFonts() {
        const localFonts = useFontStore.list
        const fontLists = { 当前页面: [], 中文: [], 英文: [] }
        for (const font of localFonts) {
          const { id, oid, value, url, alias, preview, lang } = font
          const item = { id, oid, value, url, alias, preview }
          lang === 'zh' ? fontLists['中文'].unshift(item) : fontLists['英文'].unshift(item)
        }
        fontLists['当前页面'] = usePageFontsFilter()
        state.fontClassList = fontLists
      }

      function finish(key, value) {
        store.dispatch('updateWidgetData', {
          uuid: dActiveElement.value.uuid,
          key,
          value,
          pushHistory: false,
        })
        setTimeout(() => {
          key === 'fontClass' && (state.fontClassList['当前页面'] = usePageFontsFilter())
        }, 300)
      }

      function layerAction(item) {
        store.dispatch('updateLayerIndex', {
          uuid: dActiveElement.value.uuid,
          value: item.value,
        })
      }

      async function textStyleAction(item) {
        let value = item.key === 'textAlign' ? item.value : item.value[item.select ? 1 : 0]
        state.innerElement[item.key] = value
        // TODO: 对竖版文字的特殊处理
        item.key === 'writingMode' && relationChange()
        await nextTick()
        store.commit('updateRect')
      }

      async function alignAction(item) {
        store.dispatch('updateAlign', {
          align: item.value,
          uuid: dActiveElement.value.uuid,
        })
        await nextTick()
        store.commit('updateRect')
      }

      function changeStyleIconList() {
        for (let i = 0; i < state.styleIconList1.length; ++i) {
          let key = state.styleIconList1[i].key
          state.styleIconList1[i].select = false
          const [unchecked, checked] = state.styleIconList1[i].value
          switch (key) {
            case 'fontWeight':
            case 'textDecoration':
            case 'fontStyle':
              if (state.innerElement[key] !== unchecked && state.innerElement[key] == checked) {
                state.styleIconList1[i].select = !state.styleIconList1[i].select
              }
              break
            case 'writingMode':
              if (state.innerElement[key] !== unchecked) {
                state.styleIconList1[i].select = true
              }
              break
          }
        }
        for (let i = 0; i < state.styleIconList2.length; i++) {
          let key = state.styleIconList2[i].key
          state.styleIconList2[i].select = false
          if (key === 'textAlign' && state.innerElement[key] === state.styleIconList2[i].value) {
            state.styleIconList2[i].select = true
            continue
          }
        }
      }

      function relationChange() {
        setTimeout(() => {
          if (dActiveElement.value.writingMode) {
            const w_record = dActiveElement.value.width
            state.innerElement.width = dActiveElement.value.height
            state.innerElement.height = w_record
          }
        }, 10)
      }

      return {
        ...toRefs(state),
        selectTextEffect,
        textStyleAction,
        finish,
        layerAction,
        alignAction
      }
    }
})
</script>

<style lang="less" scoped>
#w-text-style {
  height: 100%;
  width: 100%;
}
.line-layout {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: space-between;
  width: 100%;
}
.style-item {
  margin-bottom: 12px;
}
.setting-list {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: space-between;
  width: 100%;
}

.slide-wrap {
  width: 100%;
  padding: 16px;
  background: #f3f5f7;
  border-radius: 6px;
}
</style>
