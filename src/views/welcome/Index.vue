<template>
  <el-row v-loading="!isGenerateFinish" :gutter="10" style="width: 100%; overflow:auto">
    <el-col :xs="24" :sm="24" :md="12" :lg="12" :xl="12"> 
      <div class="layout_item">
        <el-form
          ref="ruleFormRef"
          :model="formInfo"
          status-icon
          :rules="rules"
          label-width="120px"
          class="demo-ruleForm"
        >
          <el-col :xs="8" :sm="12" :md="18" :lg="18" :xl="18" >
            <el-form-item label="类型" prop="bizName">
              <el-select v-model="formInfo.bizName" placeholder="请选择你的海报分类">
                <el-option label="食品" value="食品" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :xs="8" :sm="12" :md="18" :lg="18" :xl="18" >
            <el-form-item label="关键词" prop="keyword">
                <el-input v-model="formInfo.keyword" placeholder="请输入生成海报的关键词" />
            </el-form-item>
          </el-col>
          <el-col :xs="8" :sm="12" :md="18" :lg="18" :xl="18" >
            <el-form-item label="参考图" prop="参考图">
              <el-upload
                class="upload-boarder"
                drag
                :action="UPDATE_URL"
                :headers="{'tenant-id':1}"
                :limit="1"
                :before-upload="beforeImgUpload"
                :on-success="handleImgSuccess"
                :on-remove="handleRemove"
                list-type="picture"
              >
                <el-icon class="el-icon--upload"><upload-filled /></el-icon>
                <div class="el-upload__text">
                  拖拽文件至此或 <em>点击上传</em>
                </div>
                <template #tip>
                  <div class="el-upload__tip">
                    请上传小于2MB的jpg/png图片
                  </div>
                </template>
              </el-upload>
            </el-form-item>
          </el-col>
          <el-col :xs="8" :sm="12" :md="18" :lg="18" :xl="18" >
            <el-form-item>
              <el-button type="primary" :disabled="!isGenerateFinish" @click="submitForm(ruleFormRef)"
                >生成</el-button
              >
              <el-button @click="resetForm(formInfo)">重置</el-button>
              <!-- <el-button @click="testUpload">测试</el-button> -->
            </el-form-item>
          </el-col>
        </el-form>
      </div>
    </el-col>
    <el-col :xs="24" :sm="24" :md="12" :lg="12" :xl="12">
      <div class="layout_item">
        <!-- 展示4张海报 -->
        <div class="generate-image" >
          <el-row>
            <h4>生成海报：</h4>
          </el-row>
          <el-row>
            <el-col v-for="imgItem in generateList" :key="imgItem.id" class="block" :xs="10" :sm="10" :md="12" :lg="12" :xl="12">
              <div class="top">
                <el-image style="width: 100px; height: 200px" :src="imgItem.cover" :fit="cover" />
              </div>
              <div class="bottom">
                <el-button class="edit" type="primary" @click="designPoster(imgItem.id)">编辑</el-button>
              </div>
            </el-col >
          </el-row>
        </div>
      </div>
    </el-col> 
  </el-row>
</template>

<script lang="ts">
import type { FormInstance, FormRules, UploadProps, UploadUserFile } from 'element-plus'
import { defineComponent, reactive, toRefs , ref} from 'vue'
import { ElMessage as ElMsg } from 'element-plus'
import app_config from '@/config'
import api from '@/api'


export default defineComponent({
  components: {
  },
  setup() {
    const state = reactive({
      formInfo: {
        bizName: '',
        keyword: '',
        imageUrl: '',
      },
      generateList: [],
      isGenerateFinish: true,
    })
    const UPDATE_URL = app_config.POSTER_API_URL + "/ai-poster/poster/upload"
    
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

    // 图片上传
    const handleRemove: UploadProps['onRemove'] = (uploadFile, uploadFiles) => {
      // console.log(uploadFile, uploadFiles)
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
      } else if (rawFile.size / 1024 / 1024 > 2) {
        console.log("aaa")
        ElMsg.error('图片大小不能超过2MB!')
        return false
      }
      return true
    }

    return {
      ...toRefs(state),
      rules,
      resetForm,
      ruleFormRef,

      UPDATE_URL,
      handleRemove,
      handleImgSuccess,
      beforeImgUpload,
    }
  },
  computed: {
  },
  mounted() {
  },
  beforeUnmount() {
  },
  methods: {
    testUpload(){
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
    },
    submitForm(formEl: FormInstance | undefined) {
      if (!formEl) return
      formEl.validate(async (valid) => {
        if (valid) {
          this.isGenerateFinish = false
          const data = await api.poster.poster_generate(this.formInfo)
          if(!data.code){
            this.generateList = data;
          }
          this.isGenerateFinish = true
        } else {
          console.log('error submit!')
          return false
        }
      })
    },
    designPoster(id: any) {
      if (!id) return
      // this.$router.push({
      //   path:'/edit',
      //   query:{
      //     id: id
      //   }
      // })
      // 另起窗口
      window.open(`${window.location.protocol + '//' + window.location.host}/edit?id=${id}`)
    },
  },
})
</script>

<style lang="less" scoped>
.el-col {
  border-radius: 4px;
}

.grid-content {
  border-radius: 4px;
  min-height: 100px;
}

.upload-boarder{
  width: 100%;
}

.layout_item{
  border: solid 1px var(--el-border-color);
  margin: 30px;
  padding: 20px;
}
.generate-image .block {
  height: 250px;
  text-align: center;
  border-right: solid 1px var(--el-border-color);
  border-bottom: solid 1px var(--el-border-color);
  display: flex;
  flex-direction: column;
}
.generate-image .block .top {
  vertical-align: middle;
  text-align: center;
}
.generate-image .block .bottom {
  vertical-align: middle;
  text-align: center;
}
.generate-image .block:nth-child(even) {
  border-right: none;
}
.generate-image .block:nth-child(3) {
  border-bottom: none;
}
.generate-image .block:nth-child(4) {
  border-bottom: none;
}
</style>
