<template>
  <div class="Empty" v-if="cards.length === 0">
    <el-empty description="没有海报..."/>
  </div>
  <div v-else>
    <div v-infinite-scroll="load" :infinite-scroll-disabled="disabled" :infinite-scroll-distance="200">
      <PostListCard :card_columns="card_columns" @show-detail="showMessage" ref="homeCardRef"></PostListCard>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, ref } from 'vue'
import PostListCard from "@/components/business/poster/PostListCard.vue"
import {resizeWaterFall, waterFallInit, waterFallMore} from "@/utils/waterFall";
import api from "@/api"

interface CardItem {
  id: number
  cover: string
  title: string
  width: number
  height: number
  load: boolean
}

type TPageOptions = {
  pageNo: number,
  pageSize: number,
  cate: number | string
  state?: number
}

// 卡片
const cards = ref<CardItem[]>([]);
const disabled = ref(true); // 初始禁用滚动加载
const posterPageRequest = ref<TPageOptions>({
  pageNo : 1,
  pageSize: 10,
  cate: 1,
  state: 1
})

const columns = ref(0)
const card_columns = ref({})
const arrHeight = ref([])


// 主页获取帖子
const doQuery = async () => {
  cards.value = await queryDate()
  waterFallInit(columns, card_columns, arrHeight, cards)
  disabled.value = false; // 启用滚动加载
};

// 无限滚动
const load = async () => {
  console.log("加载更多")
  disabled.value = true;
  
  const more = await queryDate()
  if (more.length === 0) {
    disabled.value = true; // 没有更多数据，禁用滚动加载
  } else {
    cards.value = [...cards.value, ...more];
    waterFallMore(arrHeight, card_columns, more)
    disabled.value = false;
  }
};


async function queryDate(){
  const res = await api.poster.page({ ...posterPageRequest.value })
  let posterList = res.list
  posterList.forEach( (item:any) => {
    item["load"] = false
  })
  if(posterList.length > 0){
    posterPageRequest.value.pageNo += 1
  }
  return posterList
}

// 详情
const showMessage = async (id, left, top) => {
  // 跳转编辑
  if (!id) return
  window.open(`${window.location.protocol + '//' + window.location.host}/edit?id=${id}`)
};

onMounted(() => {
  doQuery();
  resizeWaterFall(columns, card_columns, arrHeight, cards)
})
</script>