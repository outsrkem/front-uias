<template>
  <div class="settings-container">
    <el-card class="box-card">
      <div class="clearfix my_refresh">
        <div>
          <el-row class="box-card-header">
            <el-button size="small" type="primary" style="margin-left: 10px" @click="onRefresh()">新建账号</el-button>
            <!-- <el-button size="small" type="primary" style="margin-left: 10px" @click="onRefresh()">删除账户</el-button> -->
          </el-row>
        </div>
        <!--刷新按钮-->
        <el-row>
          <el-button size="small" type="primary" @click="onRefresh" style="margin-left: 10px">刷新</el-button>
        </el-row>
        <!--/刷新按钮-->
      </div>
      <!--内容开始-->
      <el-table :data="tableData" style="width: 100%" v-loading="loading" element-loading-text="加载中"
        element-loading-spinner="el-icon-loading">
        <el-table-column prop="account" label="用户名"/>
        <el-table-column prop="description" label="描述"/>
        <el-table-column label="状态">
            <template #default="scope">
                <div class="icon" v-if="scope.row.enabled">
                    <el-icon :size="16" style="color: #50D4AB;padding-right: 10px"><SuccessFilled /></el-icon>
                    <span >启用</span>
                </div>
                <div class="icon" v-else>
                    <el-icon :size="16" style="color: #ADB0B8;padding-right: 10px"><RemoveFilled /></el-icon>
                    <span >禁用</span>
                </div>                
            </template>
        </el-table-column>
        <el-table-column label="上次登录时间">
            <template #default="scope">{{ formatDate(scope.row.last_login_at) }}</template>
        </el-table-column>
        <el-table-column label="创建时间">
            <template #default="scope">{{ formatDate(scope.row.create_time) }}</template>
        </el-table-column>
        <el-table-column label="操作">
            <template #default="scope">
                <el-button link type="primary" @click="onSelectService(scope.row.id)">授权</el-button>
                <el-button link type="primary" @click="onSelectService(scope.row.id)">编辑</el-button>
                <el-button link type="primary" @click="onSelectService(scope.row.id)">删除</el-button>
            </template>
        </el-table-column>
      </el-table>
    <!--分页开始-->
    <Pagination :pageTotal="pageTotal"  :pageSize="pageSize"
    @CurrentChange="onCurrentChange" @SizeChange="onSizeChange">
    </Pagination>
    <!--分页结束-->
    </el-card>
  </div>
</template>
      
<script>
import Pagination from "@/components/pagination/pagination";
import { formatTime } from '@/utils/date.js'
import { GetAccount } from '@/api/index.js'

export default {
    name: 'AccountIndex',
    components: { Pagination },
  data() {
        return {
            tableData: [],
            loading: true,
            pageTotal: 0,
            pageSize: 10,
            page: 1
        }
    },
    methods: {
        loadGetAccount: async function (page_size, page) {
            try {
                const params = { page_size: page_size, page: page }
                const res = await GetAccount(params)
                this.tableData = res.payload.items
                this.loading = false
                this.pageTotal = res.payload.page_info.total
            } catch (err) {
                this.tableData = []
                this.loading = false
            }
        },
        formatDate(time) {
            return formatTime(time)
        },
        onSelectService(sid) {
            console.log('点击了按钮',sid)
        },
        onRefresh() {
            this.loading = true
            this.loadGetAccount()
        },
        onCurrentChange(p) {
            this.page = p
            this.loadGetAccount(this.pageSize, p)
        },
        onSizeChange(s) {
            this.pageSize = s
            this.loadGetAccount(s, 1)
        },
    },
    created() {
        this.loadGetAccount(this.pageSize, this.page)
    }
    
}
</script>
      
<style scoped lang="less">
    .my_refresh {
        display: flex;
        justify-content: space-between;
        align-items: center;
    }
    .icon{
        display: flex;
        align-items: center;
    }
</style>
      
