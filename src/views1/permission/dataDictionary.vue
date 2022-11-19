<template>
    <div class="app-container">
      <div class="filter-container">
        <search :searchFields.sync='dataDictionary' @searchData='handleFilter' @addData='handleCreate'/>
      </div>
  
      <el-table
        :key="tableKey"
        v-loading="listLoading"
        :data="list"
        border
        fit
        highlight-current-row
      >
      <!-- @sort-change="sortChange" -->
        <el-table-column :label="$t('table.id')" type="index"  align="center" width="80" >
        </el-table-column>
        <el-table-column v-for="item,index in dataDictionary" :key="index" :label="item.label" :width="item.width || '120px'" align="center">
            <template slot-scope="{row}">
              <span>{{ row[item.key] }}</span>
            </template>
          </el-table-column>
        <el-table-column :label="'操作'" align="center" width="230" class-name="small-padding fixed-width">
          <template slot-scope="{row,$index}">
            <el-button type="success" size="mini" @click="handleUpdate(row)">
              {{ $t('table.edit') }}
            </el-button>
            <el-button v-if="row.status!='deleted'" size="mini" type="danger" @click="handleDelete(row,$index)">
              {{ $t('table.delete') }}
            </el-button>
          </template>
        </el-table-column>
      </el-table>
  
      <pagination style="margin-top:0" v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.size" @pagination="getList" />
  
      <el-dialog :title="dialogStatus" :visible.sync="dialogFormVisible">
        <el-form ref="dataForm" :model="temp" label-position="left" label-width="100px" style="width: 400px; margin-left:36px;">
            <el-form-item v-for="item,index in dataDictionary" :key="index" :label="item.label" :prop="item.key" :required="item.required" :rules="formRules(item)">
                <el-input v-model="temp[item.key]" :disabled="dialogStatus==='编辑' && item.editDisabled"/>
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
  import Pagination from '@/components/Pagination' // secondary package based on el-pagination
  import utilsApi from '@/utils/utilsApi'
  import moment from 'moment'
  import Search from '@/components/Search'
  import { dataDictionary, formRules } from '@/utils/table'
  
  export default {
    name: 'UserPermission',
    components: { Pagination, Search },
    data() {
      return {
        tableKey: 0,
        list: null,
        total: 0,
        listLoading: true,
        listQuery: {
          page: 1,
          size: 10,
        },
        temp: {},
        dialogFormVisible: false,
        dialogStatus: '',
        textMap: {
          update: '编辑',
          create: '新增'
        },
        dataDictionary,
      }
    },
    created() {
      for(let i of dataDictionary){
        this.temp[i.key] = i.value
      }
      this.getList()
    },
    methods: {
        formRules,
        searchObj() {
            let obj = {}
            for(let i of this.dataDictionary){
                if(i.filter)obj[i.key] = i.value
            }
            return obj
        },
      async getList() {
        this.listLoading = true
        let data = {
            page: this.listQuery.page,
            size: this.listQuery.size,
        }
        let res = await utilsApi.dictionaryFindPage(Object.assign(data, this.searchObj()))
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
            roleId: undefined
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
            let res = await utilsApi.updateDictionary(data)
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
            let res = await utilsApi.updateDictionary(this.temp)
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
      async handleDelete(row, index) {
        this.$alert('确定删除该数据？', '删除', {
          confirmButtonText: '确定',
          callback: async action => {
            if(action != 'confirm'){
                return
            }
            let res = await utilsApi.delDictionary({id: row.id})
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
  