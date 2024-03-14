<template>
  <el-container class="home_container" style="height:100%;width:100%;">
    <!-- 头部区域 -->
    <el-header style="with:100%">
      <el-menu
        style="width:100%"
        mode="horizontal"
        text-color="#fff"
        background-color="#A82521"
        active-text-color="#F2F2F2"
        unique-opened
        :collapse="isCollapse"
        :collapse-transition="false"
        :router="true"
        >
        <el-menu-item index="/">
          <img
            style="width: 123px;"
            :src="getLogoUrl()"
            alt="CW logo"
          />
        </el-menu-item>
        <div v-for="item in menulist" :key="item.id">
          <el-subMenu v-if="item.children.length > 0" :index="item.id+1+''">
            <!-- 一级菜单模板区域 -->
            <template #title>
              <el-icon :class="iconsObj[item.id]"></el-icon>
              <span>{{item.authName}}</span>
            </template>
            <!-- 二级菜单 -->
              <el-menu-item  v-for="subItem in item.children" :key="subItem.id" :index="subItem.path">
                <template #title>
                  <el-icon class="iconfont icon-thunderbolt"></el-icon>
                  <span>{{subItem.authName}}</span>
                </template>
              </el-menu-item>
          </el-subMenu>
          <el-menu-item v-else :index="item.path" >
            <el-icon :class="iconsObj[item.id]"></el-icon>
            <span>{{item.authName}}</span>
          </el-menu-item>
        </div>
      </el-menu>
    </el-header>

    <!-- 页面主体区域 -->
    <el-container style="height:100%;width:100%;overflow:auto">
        <!-- 路由占位符 -->
        <router-view></router-view>
    </el-container>
  </el-container>
</template>

<script lang="ts">
import _config from '../config'
import { defineComponent, reactive, toRefs } from 'vue'
import { mapActions, mapGetters } from 'vuex'

export default defineComponent({
  components: {
  },
  mixins: [],
  setup() {
    const state = reactive({
      menulist:[
        {
          id: 1,
          path: "/welcome",
          authName: "主页",
          children: []
        },
        {
          id: 2,
          path: "/design",
          authName: "设计",
          children: []
        }
      ],
      iconsObj: {
        1: 'iconfont icon-home',
        2: 'iconfont icon-skin',
        3: 'iconfont icon-drag',
        4: 'iconfont icon-thunderbolt',
        5: 'iconfont icon-fire'
      },
      // 是否折叠
      isCollapse: false
    })
    const getLogoUrl = () => {
      return new URL(`../assets/image/cw_logo.png`, import.meta.url).href
    }
    return {
      ...toRefs(state),
      getLogoUrl
    }
  },
  computed: {
  },
  // watch: {
  //   $route() {
  //     console.log('change route', this.$route.query)
  //     this.loadData()
  //   },
  // },
  mounted() {
  },
  beforeUnmount() {
  },
  methods: {
    logout () {
      window.sessionStorage.clear()
      this.$router.push('/login')
    },
    // 点击按钮，切换菜单的折叠与展开
    toggleCollapse () {
      this.isCollapse = !this.isCollapse
    },
  },
})
</script>

<style lang="less" scoped>
.home_container {
  height: 100%;
}
.home_container .el-menu {
  width: 100%;
}
.home_container .el-menu--horizontal>.el-menu-item{
  height: auto !important;
}
.home_container .el-header {
  // 给头部设置一下弹性布局
  // display: flex;
  // 让它贴标左右对齐
  // justify-content: space-between;
  // 清空图片左侧padding
  padding-left: 0;
  padding-right: 0;
  // 按钮居中
  // align-items: center;
  // 文本颜色
  color: #fff;
  font-weight: bold;
  // 设置文本字体大小
  font-size: 23px;
  // 嵌套
}
.home_container .iconfont{
  margin-right: 19px;
}
.home_container .toggle-button{
 // 添加背景颜色
 background-color: #4A5064;
 // 设置文本大小
 font-size:10px;
 // 设置文本行高
 line-height:24px;
 // 设置文本颜色
 color:#fff;
 // 设置文本居中
 text-align: center;
 // 设置文本间距
 letter-spacing: 0.2em;
 // 设置鼠标悬浮变小手效果
 cursor:pointer;
}


</style>
