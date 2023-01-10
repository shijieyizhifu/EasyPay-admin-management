<template>
    <div class="app-container">
      <div class="filter-container">
        <el-input v-model="listQuery.username" :placeholder="'用户名'" style="width: 200px;" class="filter-item" @keyup.enter.native="handleFilter" />
        <el-button style="margin-left: 10px;" v-waves class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">
          {{ $t('table.search') }}
        </el-button>
        <el-button class="filter-item" style="margin-left: 10px;" type="primary" icon="el-icon-edit" @click="handleCreate">
          {{ $t('table.add') }}
        </el-button>
      </div>

      <el-alert
          title="重置的登录密码：admin123456"
          :closable="false"
          style="margin-bottom: 12px;"
          type="warning">
      </el-alert>
  
      <el-table
        :key="tableKey"
        v-loading="listLoading"
        :data="list"
        border
        fit
        highlight-current-row
        style="width: 100%;"
      >
      <!-- @sort-change="sortChange" -->
        <el-table-column :label="$t('table.id')" type="index"  align="center" width="80" >
        </el-table-column>
        <el-table-column :label="'用户员'" width="110px" align="center">
            <template slot-scope="{row}">
              <span>{{ row.username }}</span>
            </template>
          </el-table-column>
        <el-table-column :label="'昵称'" width="110px" align="center">
        <template slot-scope="{row}">
            <span>{{ row.nickName }}</span>
        </template>
        </el-table-column>
        <el-table-column :label="'创建时间'" width="160px" align="center">
            <template slot-scope="{row}">
              <span>{{ row.createdTime }}</span>
            </template>
          </el-table-column>
        <el-table-column :label="'角色'" width="110px" align="center">
          <template slot-scope="{row}">
            <span>{{ row.roleName }}</span>
          </template>
        </el-table-column>
        <el-table-column  :label="'手机号'" width="110px" align="center">
          <template slot-scope="{row}">
            <span >{{ row.mobile }}</span>
          </template>
        </el-table-column>
        <el-table-column  :label="'邮箱'" width="180px" align="center">
          <template slot-scope="{row}">
            <span >{{ row.email }}</span>
          </template>
        </el-table-column>
        <el-table-column :label="'操作'" align="center" width="230" class-name="small-padding fixed-width">
          <template slot-scope="{row,$index}">
            <el-button type="success" size="mini" @click="handleUpdate(row)">
              {{ $t('table.edit') }}
            </el-button>
            <el-button type="warning" size="mini" @click="resetPwd(row)">
                重置密码
              </el-button>
            <el-button v-if="row.status!='deleted'" size="mini" type="danger" @click="handleDelete(row,$index)">
              {{ $t('table.delete') }}
            </el-button>
          </template>
        </el-table-column>
      </el-table>
  
      <pagination style="margin-top:0" v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.size" @pagination="getList" />
  
      <el-dialog :close-on-click-modal='false'  :close-on-press-escape='false' :title="dialogStatus" :visible.sync="dialogFormVisible">
        <el-form ref="dataForm" :rules="rules" :model="temp" label-position="left" label-width="70px" style="width: 400px; margin-left:50px;">
            <el-form-item :label="'用户名'" prop="username">
                <el-input v-model="temp.username" :disabled="dialogStatus==='编辑'"/>
            </el-form-item>
            <el-form-item :label="'昵称'" prop="nickName">
                <el-input v-model="temp.nickName" />
            </el-form-item>
            <el-form-item :label="'邮箱'" prop="email">
              <el-input v-model="temp.email" />
            </el-form-item>
            <el-form-item :label="'角色'"  prop="roleId">
                <el-select v-model="temp.roleId" class="filter-item" placeholder="">
                  <el-option v-for="item in roles" :key="item.id" :label="item.name" :value="item.id" />
                </el-select>
            </el-form-item>
            <el-form-item :label="'手机号'"  prop="mobile">
                <el-input v-model="temp.mobile" />
            </el-form-item>
            <el-form-item :label="'状态'" prop="status">
                <el-select v-model="temp.status" class="filter-item" placeholder="">
                  <el-option v-for="item in userStatus" :key="item.label" :label="item.label" :value="item.value" />
                </el-select>
            </el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer">
          <el-button @click="dialogFormVisible = false">
            {{ $t('table.cancel') }}
          </el-button>
          <el-button type="primary" @click="dialogStatus==='新增'?createData():updateData()">
            {{ $t('table.confirm') }}
          </el-button>
        </div>
      </el-dialog>
    </div>
  </template>
  
  <script>
  import { fetchList, fetchPv, createArticle, updateArticle } from '@/api/article'
  import waves from '@/directive/waves' // waves directive
  import { parseTime } from '@/utils'
  import Pagination from '@/components/Pagination' // secondary package based on el-pagination
  import utilsApi from '@/utils/utilsApi'
  import { userStatus } from '@/utils/selectList'
  import moment from 'moment'
  
  export default {
    name: 'UserPermission',
    components: { Pagination },
    directives: { waves },
    data() {
      return {
        tableKey: 0,
        list: null,
        total: 0,
        listLoading: true,
        listQuery: {
          page: 1,
          size: 10,
          username: undefined,
        },
        roles: [],
        temp: {
            username: undefined, 
            nickName: undefined,
            mobile: undefined,
            status: undefined,
            roleId: undefined,
            email: undefined
        },
        dialogFormVisible: false,
        dialogStatus: '',
        textMap: {
          update: '编辑',
          create: '新增'
        },
        pvData: [],
        rules: {
            username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
            nickName: [{ required: true, message: '请输入昵称', trigger: 'blur' }],
            roleId: [{ required: true, message: '请选择角色', trigger: 'change' }],
            mobile: [{ required: true, message: '请输入手机号', trigger: 'blur' }],
            email: [{ required: true, message: '请输入邮箱', trigger: 'blur' }],
            status: [{ required: true, message: '请选择状态', trigger: 'change' }],
        },
        userStatus,
      }
    },
    created() {
      this.getList()
      this.getRoles()
    },
    methods: {
      async getRoles() {
        const res = await utilsApi.getAllRoles()
        this.roles = res.data
      },
      getLabelStatus(value) {
        for(let i of this.userStatus) {
            if(i.value == value) {
                return i.label
            }
        }
        return ''
      },
      async getList() {
        this.listLoading = true
        let data = {
            page: this.listQuery.page,
            size: this.listQuery.size,
            username: this.listQuery.username
        }
        let res = await utilsApi.getUsers(data)
        this.listLoading = false
        if(res.code == 0){
            this.list = res.data.records
            this.total = res.data.total
        }
      },
      handleFilter() {
        this.listQuery.page = 1
        this.getList()
      },
      resetTemp() {
        this.temp = {
            username: undefined, 
            nickName: undefined,
            mobile: undefined,
            status: undefined,
            roleId: undefined,
            email: undefined
        }
      },
      handleCreate() {
        this.resetTemp()
        this.dialogStatus = '新增'
        this.dialogFormVisible = true
        this.$nextTick(() => {
          this.$refs['dataForm'].clearValidate()
        })
      },
      createData() {
        this.$refs['dataForm'].validate(async (valid) => {
          if (valid) {
            let data = JSON.parse(JSON.stringify(this.temp))
            delete data.id
            let res = await utilsApi.updateUser(data)
            if(res.code == 0){
                this.$notify({
                    title: '成功',
                    message: '创建成功',
                    type: 'success',
                    duration: 2000
                })
                this.getList()
                this.dialogFormVisible = false
            }
          }
        })
      },
      handleUpdate(row) {
        this.temp = row
        this.dialogStatus = '编辑'
        this.dialogFormVisible = true
        this.$nextTick(() => {
          this.$refs['dataForm'].clearValidate()
        })
      },
      updateData() {
        this.$refs['dataForm'].validate(async(valid) => {
          if (valid) {
            let res = await utilsApi.updateUser(this.temp)
            if(res.code == 0){
                this.$notify({
                    title: '成功',
                    message: '更新成功',
                    type: 'success',
                    duration: 2000
                })
                this.getList()
                this.dialogFormVisible = false
            }
          }
        })
      },
      async resetPwd(row) {
        this.$alert('确定重置该用户密码？', '重置密码', {
          confirmButtonText: '确定',
          callback: async action => {
            if(action != 'confirm'){
                return
            }
            let res = await utilsApi.resetUser({id: row.id})
            if(res.code == 0){
                this.$notify({
                    title: '成功',
                    message: '重置密码成功',
                    type: 'success',
                    duration: 2000
                })
                this.getList()
            }
          }
        });
      },
      async handleDelete(row, index) {
        this.$alert('确定删除该用户？', '删除', {
          confirmButtonText: '确定',
          callback: async action => {
            if(action != 'confirm'){
                return
            }
            let res = await utilsApi.delUser({id: row.id})
            if(res.code == 0){
                this.$notify({
                    title: '成功',
                    message: '删除成功',
                    type: 'success',
                    duration: 2000
                })
                this.getList()
            }
          }
        });
      },
    }
  }
  </script>
  