<template>
  <div class="col">
    <div v-for="col in card_columns" :key="col.id">
      <section v-for="card in col" :key="card.id">

        <el-card v-show="card.load" style=" padding: 0; border-radius: 0.8rem;"
          :body-style="{ padding: '0px', marginBottom: '1px' }"
        >
          <el-image class="image" 
                  :src="card.cover" 
                  fit="contain"
                  @load="handleLoad(card)"
                  @click="showViewer(card.cover)"  />
          <div style="padding: 10px" @click="details(card.id)">
            <div style="margin-bottom: 10px;height: 20px;overflow: hidden;text-overflow: ellipsis;white-space: nowrap;">
              <span style="font-size: 1.0rem;">ID:{{ card.id }}丨{{card.title}}</span>
            </div>
            <div class="bottom">
              <el-row style="align-items: center;">
                <!-- <RouterLink :to="`/user/index/${card.id}`">
                  <el-avatar
                      :src="card.avatar" size="small"
                  />
                </RouterLink> -->
                <div class="username">创建时间：{{formatDate(card.createTime)}}</div>
                <div class="del" @click.stop="delPoster(card.id, card.title)">
                  <i class="iconfont icon-delete"></i>
                </div>
              </el-row>
            </div>
          </div>
        </el-card>

        <div v-if="!card.load">
          <div class="card loading">
            <div class="image" :style="{height: card.height / (card.width / 250) + 'px'}">
            </div>
            <div style="padding: 10px">
              <div
                  style="margin-bottom: 10px;height: 20px;overflow: hidden;text-overflow: ellipsis;white-space: nowrap;">
                <span style="font-size: 1.0rem;" @click="details(card.id)">{{ card.title }}</span>
              </div>
              <div class="bottom">
                <el-row style="align-items: center;">
                  <!-- <RouterLink :to="`/user/index/${card.id}`">
                    <div class="avatar"></div>
                  </RouterLink> -->
                  <div class="username">创建时间：{{ formatDate(card.createTime) }}</div>
                  <div class="del">
                    <i class="iconfont icon-delete"></i>
                  </div>
                </el-row>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
    <el-image-viewer
        v-if="imgPreviewShow"
        @close="closeViewer"
        :url-list="[imgPreviewUrl]" />
  </div>
  
</template>

<script setup>
import {ref} from "vue";
import {ElMessageBox, ElMessage} from 'element-plus'

defineProps({
  card_columns: {
    default: () => {
    }
  }
})


const emit = defineEmits(['show-detail', 'del-poster'])
const details = (id) => {
  const target = event.target;
  const left = target.x;
  const top = target.y;
  emit('show-detail', id, left, top)
}
const ok = ref(false)
const handleLoad = (card) => {
  card.load = true
}

// 删除海报
function delPoster(id, title){
  ElMessageBox.confirm(
    '是否删除海报: ' + id + ":" +title + "?",
    'Warning',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  )
    .then(() => {
      emit('del-poster', id)
    })
    .catch(() => {
      ElMessage({
        type: 'info',
        message: '取消删除',
      })
    })
}

// 图片预览
const imgPreviewShow = ref(false)
const imgPreviewUrl = ref("")
function showViewer(url){
  imgPreviewShow.value = true;
  imgPreviewUrl.value = url;
}
function closeViewer() {
  imgPreviewShow.value = false;
  console.log(imgPreviewShow.value)
}

function formatDate(str){
  let date = new Date(str);
  let year = date.getFullYear();
  let month= date.getMonth() + 1;
  month= month< 10 ? ('0' + month) : month;
  let day = date.getDate();
  day = day < 10 ? ('0' + day ) : day ;
  let h = date.getHours();
  h = h < 10 ? ('0' + h) : h;
  let m = date.getMinutes();
  m = m < 10 ? ('0' + m) : m;
  let s = date.getSeconds();
  s = s < 10 ? ('0' + s) : s;
  return year + '-' + month + '-' + day + ' ' + h + ':' + m + ':' + s;
}

</script>

<style scoped>
.col {
  display: flex;
  flex-direction: row;
  justify-content: center;
}

.loading .image,
.loading .avatar {
  background: gainsboro linear-gradient(
      100deg,
      rgba(255, 255, 255, 0) 40%,
      rgba(255, 255, 255, .5) 50%,
      rgba(255, 255, 255, 0) 60%
  );
  background-size: 200% 100%;
  background-position-x: 180%;
  animation: 1s loading ease-in-out infinite;
}

@keyframes loading {
  to {
    background-position-x: -20%;
  }
}

.loading .avatar {
  border-radius: 50%;
  height: 24px;
  width: 24px;
}

section {
  width: 250px;
  break-inside: avoid; /* 防止卡片被分割在两列中 */
  margin: 20px 20px 20px 20px;
}

.card {
  border-radius: 0.8rem;
  background-color: transparent;
}

.image {
  width: 250px;
  border-radius: 0.8rem;
  object-fit: fill;
}

.image:hover {
  opacity: 0.7;
}

.bottom {
  position: relative;
}
.username {
  /* margin-left: 10px; */
  font-weight: 200;
  font-size: 0.5rem;
}
.del {
  position: absolute;
  right : 10px;
  font-weight: 100;
  font-size: 0.3rem;
}
.del .iconfont {
  font-size: 14px;
  transition: all 0.2s ease-in;
}

/* 鼠标移入悬浮效果 */
.del .iconfont:hover{    
  font-size: 18px;
  color:rgb(44, 178, 178);
  -webkit-box-shadow: 0 0 30px rgba(0,0,0,0.1);
  box-shadow: 0 0 30px rgba(0,0,0,0.15);
  -webkit-transform: translate3d(0, 0px, -2px);
  transform: translate3d(0, 1px, -2px);    
}


</style>