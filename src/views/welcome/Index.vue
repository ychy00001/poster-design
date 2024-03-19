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
              <el-form-item label="类&#12288;型" prop="bizName" >
                <el-select v-model="state.formInfo.bizName" placeholder="请选择分类">
                  <el-option label="食品" value="食品" />
                </el-select>
              </el-form-item>
              <el-form-item label="关键词" prop="keyword" >
                  <el-input v-model="state.formInfo.keyword" placeholder="输入关键词" />
              </el-form-item>
              <el-form-item label="参考图" prop="参考图">
                <el-upload
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
      <el-main class="gen-main" v-loading="!state.isGenerateFinish" :xs="12" :sm="12" :md="16" :lg="16" :xl="16">
        <!-- 展示4张海报 -->
        <div v-if="state.generateList.length > 0" class="generate-image" >
          <div class="gen-item" v-for="imgItem in state.generateList" :key="imgItem.id" >
            <el-image :src="imgItem.cover" fit="contain"  style="height:93%;" @click="designPoster(imgItem.id)" />
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
import { defineComponent, reactive, toRefs , ref, onMounted} from 'vue'
import { ElMessage as ElMsg } from 'element-plus'
import app_config from '@/config'
import api from '@/api'

const state = reactive({
  formInfo: {
    bizName: '',
    keyword: '',
    imageUrl: '',
    isSegmentation: false,
  },
  generateList:[],
  isGenerateFinish: true,
})

onMounted(() => {
  // 临时测试
  // state.generateList = [
  //   {
  //     id: 1,
  //     cover: "http://10.128.172.93:52710/cw-poster/images/normal/4669B9C2_5EAD7937.jpeg",
  //   },
  //   {
  //     id: 1,
  //     cover: "http://10.128.172.93:52710/cw-poster/images/normal/4669B9C2_5EAD7937.jpeg",
  //   },
  //   {
  //     id: 1,
  //     cover: "http://10.128.172.93:52710/cw-poster/images/normal/4669B9C2_5EAD7937.jpeg",
  //   },
  //   {
  //     id: 1,
  //     cover: "http://10.128.172.93:52710/cw-poster/images/normal/4669B9C2_5EAD7937.jpeg",
  //   },
  // ]
})

// 图片上传
const dialogImageUrl = ref('')
const dialogVisible = ref(false)
const disabled = ref(false)
const UPDATE_URL = app_config.POSTER_API_URL + "/ai-poster/poster/upload"

const genLoding = ref<FormInstance>()

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
  keyword: [{ validator: validateKeyword, trigger: 'blur' }],
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
      const data = await api.poster.poster_generate(state.formInfo)
      if(!data.code){
        state.generateList = data;
      }
      state.isGenerateFinish = true
    } else {
      console.log('error submit!')
      return false
    }
  })
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

.el-aside{
  border: solid 1px var(--el-border-color);
  height: 100%;
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

</style>
