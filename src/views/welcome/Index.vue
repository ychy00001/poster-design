<template>
  <div class="welcome">
    <el-container style="height: 100%">
      <el-aside :xs="12" :sm="12" :md="8" :lg="8" :xl="8">
        <div class="aside-content">
          <div class="aside-main">
            <el-form
              ref="ruleFormRef"
              :model="state.formInfo"
              status-icon
              :rules="rules"
              class="demo-ruleForm"
              label-width="auto"
            >
              <el-form-item label="行&#12288;业" prop="bizName" >
                <el-select v-model="state.formInfo.bizName" placeholder="请选择分类" disabled="true" value="食品">
                  <el-option label="食品" value="食品" />
                </el-select>
              </el-form-item>
              <el-form-item label="风&#12288;格" prop="keyword" >
                <el-checkbox-group v-model="selectKeywords">
                  <el-checkbox-button v-for="keyword in keywords" :key="keyword" :value="keyword" >
                    {{keyword}}
                  </el-checkbox-button>
                </el-checkbox-group>
              </el-form-item>
              <el-form-item label="产品图" prop="产品图">
                <el-upload
                  ref="imgRef"
                  class="upload-boarder"
                  :action="UPDATE_URL"
                  :headers="{'tenant-id':1}"
                  :limit="1"
                  :show-file-list="false"
                  :before-upload="beforeImgUpload"
                  :on-success="handleImgSuccess"
                >
                  <!-- <img v-if="state.formInfo.imageUrl" :src="state.formInfo.imageUrl" class="avatar" /> -->
                  <div v-if="state.formInfo.imageUrl">
                    <ul class="el-upload-list el-upload-list--picture-card">
                      <li class="el-upload-list__item is-ready">
                        <img class="el-upload-list__item-thumbnail" :src="state.formInfo.imageUrl" alt="" />
                        <span class="el-upload-list__item-actions">
                          <span
                            class="el-upload-list__item-preview"
                            @click.stop="handlePictureCardPreview(state.formInfo.imageUrl)"
                          >
                            <el-icon><zoom-in /></el-icon>
                          </span>
                          <!-- <span
                            v-if="!disabled"
                            class="el-upload-list__item-delete"
                            @click.stop="handleDownload(state.formInfo.imageUrl)"
                          >
                            <el-icon><Download /></el-icon>
                          </span> -->
                          <span
                            v-if="!disabled"
                            class="el-upload-list__item-delete"
                            @click.stop="handleRemove(state.formInfo.imageUrl)"
                          >
                            <el-icon><Delete /></el-icon>
                          </span>
                        </span>
                      </li>
                    </ul>
                  </div>
                  <el-icon v-else class="upload-icon"><span class="iconfont icon-cloud-upload" style="font-size:18px;"></span></el-icon>
                </el-upload>
              </el-form-item>
              <el-form-item label="抠&#12288;图" prop="isSegmentation" >
                  <el-switch v-model="state.formInfo.isSegmentation" />
              </el-form-item>
            </el-form>
          </div>
          <div class="aside-footer">
            <el-form-item>
              <el-button type="primary" :disabled="!state.isGenerateFinish" @click="submitForm(ruleFormRef)">
              <img src="https://cdn.dancf.com/fe-assets/20240124/e5f503d0c1b6af372e51a9190e188aed.svg" class="submit-btn__star-icon">开始生成
              </el-button>
              <!-- <el-button @click="resetForm(formInfo)">重置</el-button> -->
            </el-form-item>
          </div>
        </div>
      </el-aside>
      <el-main class="gen-main" :xs="12" :sm="12" :md="16" :lg="16" :xl="16">
        <!-- 展示4张海报 -->
        <div v-if="state.generateList.length > 0" class="generate-image" >
          <div class="gen-item" v-for="imgItem in state.generateList" :key="imgItem.id" >
            <el-image v-if="imgItem.genState == 0" :src="imgItem.cover" fit="contain"  style="height:93%;" @click="designPoster(imgItem.id)" />
            <div v-else class="gen-loading">
              <div class="loading-text">
                <div v-if="imgItem.genState == 1" class="generating"></div>
                <div v-if="imgItem.genState == 2" class="queueing"></div>
              </div>
              <div class="loading">
                <div class="shape shape-4">
                  <div class="shape-4-top"></div>
                  <div class="shape-4-bottom"></div>
                  <div class="shape-4-eye"></div>
                </div>
                <div class="shape shape-1"></div>
                <div class="shape shape-2"></div>
                <div class="shape shape-3"></div>
              </div>
            </div>
            <!-- <el-button class="edit" type="primary" @click="designPoster(imgItem.id)">编辑</el-button> -->
          </div>
        </div>
        <div v-else class="generate-empty edit-templates__initialized">
            <img src="https://cdn.dancf.com/fe-assets/20240130/7ea50bbdfb3e7527eb46edd82d56093e.png" class="generate-empty__img">
            <div class="generate-empty__title">智能设计 🎉</div>
            <div class="generate-empty__desc">快去左侧输入你的灵感创意吧~</div>
          </div>
      </el-main>
    </el-container>
  </div>
  <el-dialog v-model="dialogVisible">
    <img w-full :src="dialogImageUrl" alt="Preview Image" />
  </el-dialog>
</template>

<script lang="ts" setup>
import type { FormInstance, FormRules, UploadProps, UploadUserFile } from 'element-plus'
import { defineComponent, reactive, toRefs , ref, onMounted, watch} from 'vue'
import { ElMessage as ElMsg } from 'element-plus'
import { useStore } from 'vuex'
import app_config from '@/config'
import api from '@/api'

const state = reactive({
  formInfo: {
    bizName: '食品',
    keyword: '通用',
    imageUrl: '',
    isSegmentation: false,
  },
  generateList:[],
  isGenerateFinish: true,
})
const store = useStore()
onMounted(() => {
  store.commit('setShowMoveable', false)
  // 临时测试
  // state.generateList = [
  //   {
  //     id: 1,
  //     cover: "http://10.128.172.93:52710/cw-poster/images/normal/4669B9C2_5EAD7937.jpeg",
  //     genState: 0, // 成功
  //   },
  //   {
  //     id: 1,
  //     cover: "http://10.128.172.93:52710/cw-poster/images/normal/4669B9C2_5EAD7937.jpeg",
  //     genState: 1, // 生成中 
  //   },
  //   {
  //     id: 1,
  //     cover: "http://10.128.172.93:52710/cw-poster/images/normal/4669B9C2_5EAD7937.jpeg",
  //     genState: 2, // 排队中
  //   },
  //   {
  //     id: 1,
  //     cover: "http://10.128.172.93:52710/cw-poster/images/normal/4669B9C2_5EAD7937.jpeg",
  //     genState: 2, // 排队中
  //   },
  // ]
})


// 可以直接侦听一个 ref
const selectKeywords = ref(['通用'])
const keywords = ['通用', '简约', '中国风', '科技风', '动感', '带货', '年轻人', '老人'
,'节日', '电商', '清新', '浪漫', '夏日凉爽', '暖色调', '冷色调', '可爱', '展台', '炫彩渐变', '便签笔记']
watch(selectKeywords, (newVal, oldVal) => {
  state.formInfo.keyword = newVal.join(",")
})

// 图片上传
const imgRef = ref<any>(null)
const dialogImageUrl = ref('')
const dialogVisible = ref(false)
const disabled = ref(false)
const UPDATE_URL = app_config.POSTER_API_URL + "/ai-poster/poster/upload"

// 表单上传
const ruleFormRef = ref<FormInstance>()

// 表单提交
const checkBiz = (rule: any, value: any, callback: any) => {
  if (!value) {
    return callback(new Error('请输入行业信息'))
  }
  callback()
}

const validateKeyword = (rule: any, value: any, callback: any) => {
  if (!value) {
    return callback(new Error('请输入关键词'))
  }
  if (value === '') {
    callback(new Error('请输入关键词'))
  }
  callback()
}

const rules = reactive<FormRules<typeof state.formInfo>>({
  bizName: [{ validator: checkBiz, trigger: 'blur' }],
})

const resetForm = (formEl: FormInstance | undefined) => {
  if (!formEl) return
  formEl.resetFields()
}

const handleImgSuccess: UploadProps['onSuccess'] = (
  response,
  uploadFile
) => {
  if(response.code == 0){
    state.formInfo.imageUrl = response.data
  }else{
    ElMsg.error('图片上传服务器失败，请删除重试!')
    return false
  }
}

const beforeImgUpload: UploadProps['beforeUpload'] = (rawFile) => {
  if (rawFile.type !== 'image/jpeg' && rawFile.type !== 'image/png') {
    ElMsg.error('图片必须是JPG或PNG格式!')
    return false
  } else if (rawFile.size / 1024 / 1024 > 5) {
    ElMsg.error('图片大小不能超过5MB!')
    return false
  }
  return true
}
const handleRemove = (file: string) => {
  state.formInfo.imageUrl = ""
  imgRef.value.clearFiles();
}

const handlePictureCardPreview = (url: string) => {
  dialogImageUrl.value = url!
  dialogVisible.value = true
}

const handleDownload = (file: string) => {
  console.log(file)
}

function testUpload(){
  const filePath = "/Users/rain/Downloads/mock.jpeg"
  const fileName = filePath.substring(filePath.lastIndexOf('/')+1)
  console.log("fileName: %s", fileName)
  const file = new File([filePath], fileName);
  console.log(file)
  const urlPromis = api.minio.genPreSignedURL({
    objectName: "/test/mock2.png"
  })
  const tmpUrl = "http://10.128.172.93:52710/cw-poster//images/normal/test/mock2.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=1y71OwYhuY3zqGA4eLhh%2F20240301%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20240301T115757Z&X-Amz-Expires=86400&X-Amz-SignedHeaders=host&X-Amz-Signature=92889ef395e67be4f9d43b72d4b68e8616d17b3ef5164ab0ad7c5d52247f4bff"
  const remoteFile = api.minio.fileUploadWithPresigned(tmpUrl,file)
  remoteFile.then((remoteObj:any)=>{
    console.log(remoteObj)
  })


  // urlPromis.then((result:any)=>{
  //   console.log(result)
  //   const remoteFile = api.minio.fileUploadWithPresigned(result,file)
  //   remoteFile.then((remoteObj:any)=>{
  //     console.log(remoteObj)
  //   })
  // })
}

function submitForm(formEl: FormInstance | undefined) {
  if (!formEl) return
  formEl.validate(async (valid) => {
    if (valid) {
      state.isGenerateFinish = false
      initLoadingState()
      const data = await api.poster.poster_generate(state.formInfo)
      if(!data.code){
        state.generateList = data;
        state.generateList.forEach((item:any) => {
          item['genState'] = 0;
        })
      }else{
        state.generateList = []
      }
      state.isGenerateFinish = true
    } else {
      console.log('error submit!')
      return false
    }
  })
}

function initLoadingState(){
  //genState 0 成功，1 生成中，2 排队中
  state.generateList = [
    {
      id: 1,
      cover: "http://10.128.172.93:52710/cw-poster/images/normal/4669B9C2_5EAD7937.jpeg",
      genState: 1, // 成功
    },
    {
      id: 2,
      cover: "http://10.128.172.93:52710/cw-poster/images/normal/4669B9C2_5EAD7937.jpeg",
      genState: 2, // 生成中 
    },
    {
      id: 3,
      cover: "http://10.128.172.93:52710/cw-poster/images/normal/4669B9C2_5EAD7937.jpeg",
      genState: 2, // 排队中
    },
    {
      id: 4,
      cover: "http://10.128.172.93:52710/cw-poster/images/normal/4669B9C2_5EAD7937.jpeg",
      genState: 2, // 排队中
    },
  ]
}

function designPoster(id: any) {
  if (!id) return
  // this.$router.push({
  //   path:'/edit',
  //   query:{
  //     id: id
  //   }
  // })
  // 另起窗口
  window.open(`${window.location.protocol + '//' + window.location.host}/edit?id=${id}`)
}
</script>

<style lang="less" scoped>

.welcome{
  width: 100%;
}

.welcome .el-form-item__label{
  color:#7f8792 !important;
  font-weight: 800 !important;
}

.welcome .el-aside{
  border: solid 1px var(--el-border-color);
  height: 100%;
  font-family: Helvetica, Tahoma, Arial, “PingFang SC”, “Hiragino Sans GB”, “Heiti SC”, STXihei, “Microsoft YaHei”, SimHei, “WenQuanYi Micro Hei”;
  width: 340px;
}

.aside-content{
  display: flex;
  min-height: 90vh;
  flex-direction: column;
}

.aside-main{
  padding: 16px 32px 0;
}

.aside-footer{
  width: 100%;
  padding: 20px 32px 24px;
  border-top: solid 1px var(--el-border-color);
  padding: 16px 32px 0;
  margin-top: auto;
}

.aside-footer .el-button {
  width: 100%;
  height: 50px;
  border: none;
  color: #ffffff;
  font-weight: 800 !important;
  cursor: pointer !important;
  font-size: 14px !important;
  border-radius: 8px;
  background: linear-gradient(90deg, #2254F4 0%, #43BBFF 100%);
  transition: all .3s cubic-bezier(.645,.045,.355,1);
  touch-action: manipulation;
}

.aside-footer .el-button:hover {
  background: linear-gradient(90deg, #2254F4 0%, #2254F4 100%);
}

.submit-btn__star-icon{
  margin-right: 8px;
}

.grid-content {
  border-radius: 4px;
  min-height: 100px;
}

.upload-icon{
  width:75px; 
  height: 75px; 
  background-color: #f6f7f9; 
  border-radius: 10px;
}

.upload-icon:hover{
  width:75px; 
  height: 75px; 
  background-color: #EEEEEE; 
  border-radius: 10px;
}

.el-upload-list__item {
  width:75px !important; 
  height: 75px !important;
  overflow: hidden;
}

.el-upload-list__item img {
  width: 100%; /* 让图片宽度填满容器 */
  height: 100%; /* 让图片高度填满容器 */
  object-fit: cover; /* 裁剪并居中图片以填满容器 */
}

.gen-main{
  width: 100%;
  height: 100%;
  padding: 56px;
  background: #F6F7F9;
}

.gen-main .generate-empty {
  width: 100%;
  height: 100%;
  background: #F6F7F9;
  border: 2px dashed #b4b8bf;
  border-radius: 24px;
  align-items: center;
  min-height: 300px;
}

.gen-main .generate-image{
  width: 100%;
  height: 100%;
  background: #F6F7F9;
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  // 水平居中 垂直居中
  // align-items: center;
  min-height: 700px;
}

.gen-main .generate-image .gen-item{
  margin-right: 60px;
  margin-bottom: 20px;
  width: calc((100% - 60px) / 2);
  height: calc((100% - 20px) / 2);
  background: #ffffff;
  border-radius: 10px;
  box-shadow: 0 4px 3px 0 grey;

  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  align-items: center;
}

.gen-main .generate-image .gen-item .el-image {
  transition: all 0.4s;//设置上浮过渡时间
  border-radius: 5px;
}

.gen-main .generate-image .gen-item .el-image:hover {
  box-shadow: 0 8px 8px 0 grey;  // 设置盒子阴影
  transform: translate(0, -10px); // 鼠标悬浮时box向上浮动的距离
}

.gen-main .generate-image .gen-item:nth-of-type(2n+0) {
  margin-right: 0;
}
.gen-main .generate-image .gen-item:nth-of-type(3) {
  margin-bottom: 0;
}
.gen-main .generate-image .gen-item:nth-of-type(4) {
  margin-bottom: 0;
}
.gen-main .generate-image .gen-item .gen-loading{
  width: 100%;
  height: 100%;
  background: #E6E6E6;
  border-radius: 10px;

  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  align-items: center;
  flex-direction: column;
}

// 加载动效
.gen-loading .loading {
  margin-top: 10px;
  width: 30px;
  height: 30px;
  position: relative;
  display: flex;
  align-items: center;
}

.gen-loading .shape {
  width: 10px;
  height: 10px;
  position: absolute;
  border-radius: 50%;
}

.gen-loading .shape-1 {
  background-color: #95DA69;
  left: -12px;
  animation: animationShape1 7s linear infinite;
}

.gen-loading .shape-2 {
  background-color: #F1AC6A;
  left: 8px;
  animation: animationShape2 7s linear infinite;
}

.gen-loading .shape-3 {
  background-color: #E777B6;
  left: 30px;
  animation: animationShape3 7s linear infinite;
}

.gen-loading .shape-4 {
  background-color: #f2b736;
  width: 30px;
  height: 30px;
  left: -40px;
  background-color: transparent !important;
  z-index: 2;
  animation: animationShape4 7s linear infinite;
}

.gen-loading .shape-4 > div {
  width: 100%;
  height: 100%;
  border-radius: 50%;
}

.gen-loading .shape-4 .shape-4-top {
  position: absolute;
  top: 0;
  left: 0;
  background-color: #70D5D7;
  clip: rect(0 30px 15px 0);
  transform: rotate(-30deg);
  animation: animationShape4Top 0.4s ease infinite alternate;
}

.gen-loading .shape-4 .shape-4-bottom {
  position: absolute;
  top: 0;
  left: 0;
  background-color: #70D5D7;
  clip: rect(15px 30px 30px 0);
  transform: rotate(45deg);
  animation: animationShape4Bottom 0.4s ease infinite alternate;
}

.gen-loading .shape-4 .shape-4-eye {
  width: 5px;
  height: 5px;
  background-color: rgba(0, 0, 0, 0.8);
  border-radius: 50%;
  position: absolute;
  top: 5px;
  right: 10px;
}

@keyframes animationShape4Top {
  0% {
    transform: rotate(-30deg);
  }

  100% {
    transform: rotate(0);
  }
}

@keyframes animationShape4Bottom {
  0% {
    transform: rotate(45deg);
  }

  100% {
    transform: rotate(0);
  }
}

@keyframes animationShape1 {
  0% {
    opacity: 1;
  }

  17% {
    opacity: 1;
  }

  19% {
    opacity: 0;
  }

  30% {
    opacity: 0;
  }

  40% {
    opacity: 1;
  }

  85% {
    opacity: 1;
  }

  90% {
    opacity: 0;
  }

  95% {
    opacity: 0;
  }

  100% {
    opacity: 1;
  }
}

@keyframes animationShape2 {
  0% {
    opacity: 1;
  }

  20% {
    opacity: 1;
  }

  22% {
    opacity: 0;
  }

  35% {
    opacity: 0;
  }

  45% {
    opacity: 1;
  }

  75% {
    opacity: 1;
  }

  80% {
    opacity: 0;
  }

  90% {
    opacity: 0;
  }

  100% {
    opacity: 1;
  }
}

@keyframes animationShape3 {
  0% {
    opacity: 1;
  }

  27% {
    opacity: 1;
  }

  29% {
    opacity: 0;
  }

  40% {
    opacity: 0;
  }

  64% {
    opacity: 1;
  }

  65% {
    opacity: 1;
  }

  70% {
    opacity: 0;
  }

  80% {
    opacity: 0;
  }

  100% {
    opacity: 1;
  }
}

@keyframes animationShape4 {
  0% {
    left: -40px;
    transform: rotateY(0);
  }

  45% {
    left: 50px;
    transform: rotateY(0);
  }

  50% {
    left: 50px;
    transform: rotateY(180deg);
  }

  95% {
    left: -40px;
    transform: rotateY(180deg);
  }

  100% {
    left: -40px;
    transform: rotateY(0);
  }
}
// 加载动效结束

// 加载动效
.gen-loading .loading-text {
  margin-top: -10px;
  height: 30px;
  position: relative;
  display: flex;
  align-items: center;
}

// 排队中
.gen-loading .loading-text .generating {
  display: inline-block;
  position: relative;
}

.gen-loading .loading-text .generating::before {
  content: "生成中...";
  color: #666;
  font-family: Arial, Helvetica, sans-serif;
  font-size: 18px;
  letter-spacing: 1px;
  display: inline-block;
  animation: loading-text-floating 0.7s ease-out infinite alternate;
}
.gen-loading .loading-text .generating::after {
  content: "";
  width: 100%;
  height: 10px;
  background: rgba(0, 0, 0, 0.15);
  position: absolute;
  left: 0;
  top: 100%;
  filter: blur(4px);
  border-radius: 50%;
  animation: loading-text-animation 0.7s ease-out infinite alternate;
}

// 生成中
.gen-loading .loading-text .queueing {
  display: inline-block;
  position: relative;
}

.gen-loading .loading-text .queueing::before {
  content: "排队中...";
  color: #666;
  font-family: Arial, Helvetica, sans-serif;
  font-size: 18px;
  letter-spacing: 1px;
  display: inline-block;
  animation: loading-text-floating 0.7s ease-out infinite alternate;
}

.gen-loading .loading-text .queueing::after {
  content: "";
  width: 100%;
  height: 10px;
  background: rgba(0, 0, 0, 0.15);
  position: absolute;
  left: 0;
  top: 100%;
  filter: blur(4px);
  border-radius: 50%;
  animation: loading-text-animation 0.7s ease-out infinite alternate;
}

@keyframes loading-text-floating {
  0% {
    transform: translateY(0);
  }

  100% {
    transform: translateY(-15px);
  }
}

@keyframes loading-text-animation {
  0% {
    transform: scale(0.8);
  }

  100% {
    transform: scale(1.2);
  }
}
// 生成中结束

.gen-main .edit-templates__initialized{
  position: relative;
  display: flex;
  justify-content: center;
  flex-direction: column;
  align-items: center;
  width: 100%;
  height: 100%;
}

.generate-empty__img{
  width: 300px;
  height: 200px;
  vertical-align: middle;
}

.generate-empty__desc{
  font: 400 14px/1.5 "PingFang SC", "Microsoft YaHei", "Hiragino Sans GB","WenQuanYi Micro Hei",Arial, sans-serif, Apple Color Emoji,Segoe UI Emoji;
  margin-top: 12px;
  color: #7f8792;
  text-align: center;
}

.generate-empty__title{
  font: 600 20px/1.3 "PingFang SC", "Microsoft YaHei", "Hiragino Sans GB","WenQuanYi Micro Hei",Arial, sans-serif, Apple Color Emoji,Segoe UI Emoji;
}

.aside-main /deep/ .el-checkbox-button__inner{
  margin: 2px 4px 2px 3px;
  border: 1px solid #e5e7eb !important;
  border-radius: 5px;
  padding: 5px 11px;
  font-size: 12px;
}

// /deep/ .el-form-item__label{
  // font-size: 14px !important;
// }
</style>
