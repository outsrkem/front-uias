<template>
    <div class="settings-container">
      <el-card class="box-card">
        <div class="clearfix my_refresh">
          <div>
            <el-row class="box-card-header">
              <el-button size="small" type="primary" style="margin-left: 10px" @click="onCreateUser()">新建策略</el-button>
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
          <el-table-column prop="name" label="策略名称"/>
          <el-table-column prop="" label="类型" min-width="50"/>
          <el-table-column prop="description" label="描述"/>
          <el-table-column label="操作">
              <template #default="scope">
                  <el-button link type="primary" :disabled="! scope.row.editable" @click="onSelectService(scope.row.id)">编辑</el-button>
                  <el-button link type="primary" :disabled="! scope.row.deletable" @click="onDeletePolicies(scope.row.id)">删除</el-button>
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
  import { GetPolicies,DeletePolicies } from '@/api/index.js'
  // import { login } from '@/api/index.js'
  export default {
      name: 'PoliciesIndex',
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
          loadGetPolicies: async function (page_size, page) {
              try {
                  const params = { page_size: page_size, page: page }
                  const res = await GetPolicies(params)
                  this.tableData = res.payload.items
                  this.loading = false
                  this.pageTotal = res.payload.page_info.total
              } catch (err) {
                  this.tableData = []
                  this.loading = false
              }
          },
        loadDeletePolicies: function (data) {
            DeletePolicies(data).then(() => {
                this.onRefresh()
            })
        },
          formatDate(time) {
              return formatTime(time)
          },
          onSelectService(sid) {
              console.log('点击了按钮',sid)
          },
          onRefresh() {
              this.loading = true
              this.loadGetPolicies()
          },
          onCurrentChange(p) {
              this.page = p
              this.loadGetPolicies(this.pageSize, p)
          },
          onSizeChange(s) {
              this.pageSize = s
              this.loadGetPolicies(s, 1)
          },
          onCreateUser() {
              this.$router.push({ path: '/policies'})
          },
        onDeletePolicies(id) {
            let pid = []
            pid.push(id)
            let data = { policy_id: pid }
            this.loadDeletePolicies(data)
        }
      },
      created() {
          this.loadGetPolicies(this.pageSize, this.page)
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
        
  