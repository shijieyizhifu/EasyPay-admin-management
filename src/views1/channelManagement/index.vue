<template>
    <div class="app-container">
        <div v-if="type != 'business'">
            <div class="filter-container">
                <search :searchFields='tradingChannel' @searchData='handleFilter' @addData='handleCreate'/>
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
                <el-table-column v-for="item,index in tradingChannel" :key="index" :label="item.label" :width="item.width || '120px'" align="center">
                    <template slot-scope="{row}">
                      <span v-if="item.type == 'select'">
                        {{ item.list.find(i => i.value == row[item.key]).name }}
                      </span>
                      <span v-else>{{ row[item.key] }}</span>
                    </template>
                  </el-table-column>
                <el-table-column :label="'操作'" fixed="right" align="center" width="230" class-name="small-padding fixed-width">
                  <template slot-scope="{row}">
                    <el-button type="success" v-if="row.status == 'N'" size="mini" @click="handleStatus(row,'Y')">
                        启用
                    </el-button>
                    <el-button type="danger" v-if="row.status == 'Y'" size="mini" @click="handleStatus(row,'N')">
                        禁用
                    </el-button>
                    <el-button type="primary" size="mini" @click="handleBusiness(row)">
                        业务
                    </el-button>
                  </template>
                </el-table-column>
              </el-table>
          
              <pagination style="margin-top:0" v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.size" @pagination="getList" />
        </div>
        <div v-else>
            <el-table
                :key="1"
                v-loading="listLoading"
                :data="businessList"
                border
                fit
                highlight-current-row
              >
              <!-- @sort-change="sortChange" -->
                <el-table-column :label="$t('table.id')" type="index"  align="center" width="80" >
                </el-table-column>
                <el-table-column v-for="item,index in tradingBusiness" :key="index" :label="item.label" :width="item.width || '120px'" align="center">
                    <template slot-scope="{row}">
                        <span v-if="item.listType == 'custom'">
                            {{ row[item.key] }}
                        </span>
                      <span v-else-if="item.type == 'select' && item.listType != 'custom'">
                        {{ item.list.find(i => i.value == row[item.key]).name }}
                      </span>
                      <span v-else>{{ row[item.key] }}</span>
                    </template>
                  </el-table-column>
                <el-table-column :label="'操作'" fixed="right" align="center" width="230" class-name="small-padding fixed-width">
                  <template slot-scope="{row}">
                    <el-button type="primary" size="mini" @click="handleUpdate1(row)">
                        修改
                    </el-button>
                  </template>
                </el-table-column>
              </el-table>
              <el-row style="display:flex;justify-content:center;margin-top: 16px;">
                <el-button style="margin-left: 10px;"  class="filter-item" type="primary"  @click="businessAdd">
                  新增
                </el-button>
                <el-button class="filter-item" style="margin-left: 10px;" type="primary"  @click="type = ''">
                  返回
                </el-button>
              </el-row>
        </div>
      <el-dialog :title="dialogStatus" :visible.sync="dialogFormVisible">
        <el-form ref="dataForm" :model="temp" label-position="left" label-width="120px" style="width: 400px; margin-left:36px;">
            <div v-for="item,index in tradingChannel" :key="index">
                <el-form-item  :label="item.label"  :prop="item.key" :required="item.required" :rules="formRules(item)">
                    <el-input v-if="!item.type" v-model="temp[item.key]" :disabled="dialogStatus==='编辑' && item.editDisabled" :placeholder="item.label"/>
                    <el-select  filterable v-if="item.type == 'select'" v-model="temp[item.key]" :placeholder="item.label">
                        <el-option v-for="(option,index) in item.list" :key="index" :label="option.name" :value="option.value"></el-option>
                      </el-select>
                </el-form-item>
            </div>
            <!-- <el-form-item :label="'通知ip检验'" :prop="'ips'">
                <el-input type="textarea"  v-model="temp.ips" placeholder="ip地址，逗号,隔开"/>
            </el-form-item> -->
            <el-form-item  :label="'谷歌验证码'" required :prop="'verifCode'" :rules="formRules({key: 'verifCode',label: '谷歌验证码',required: true})">
              <el-input  v-model="temp.verifCode" :placeholder="'谷歌验证码'"/>
            </el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer">
          <el-button @click="dialogFormVisible = false">
            {{ $t('table.cancel') }}
          </el-button>
          <el-button type="primary" :loading="buttonLoading" @click="dialogStatus==='新增'?createData():updateData()">
            {{ $t('table.confirm') }}
          </el-button>
        </div>
      </el-dialog>
      <el-dialog :title="dialogStatus1" :visible.sync="dialogFormVisible1">
        <el-form ref="dataForm1" :model="temp1" label-position="left" label-width="120px" style="width: 400px; margin-left:36px;">
            <div v-for="item,index in tradingBusiness" :key="index">
                <el-form-item  :label="item.label"  :prop="item.key" :required="item.required" :rules="formRules(item)">
                    <el-input v-if="!item.type" v-model="temp1[item.key]" :disabled="dialogStatus1 ==='编辑' && item.editDisabled" :placeholder="item.label"/>
                    <el-select  filterable v-if="item.type == 'select'" v-model="temp1[item.key]" :placeholder="item.label">
                        <el-option v-for="(option,index) in item.list" :key="index" :label="option.name" :value="option.value"></el-option>
                      </el-select>
                </el-form-item>
            </div>
        </el-form>
        <div slot="footer" class="dialog-footer">
          <el-button @click="dialogFormVisible1 = false">
            {{ $t('table.cancel') }}
          </el-button>
          <el-button type="primary" :loading="buttonLoading" @click="dialogStatus1==='新增'?createData1():updateData1()">
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
  import { tradingChannel, formRules, tradingBusiness } from '@/utils/table'
  
  export default {
    name: 'TradingChannel',
    components: { Pagination, Search },
    data() {
      return {
        buttonLoading: false,
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
        dialogFormVisible1: false,
        dialogStatus: '',
        dialogStatus1: '',
        textMap: {
          update: '编辑',
          create: '新增'
        },
        tradingChannel,
        tradingBusiness,
        type: '',
        temp1: {},
        businessList: [],
        currentRow: {}
      }
    },
    async created() {
      for(let i of tradingChannel){
        this.temp[i.key] = i.value
        if(i.type == 'select'){
            i.list = (await utilsApi.dictionaryFindPage({type: i.listKey || i.key})).data.records
        }
      }
      this.getList()
      for(let i of tradingBusiness){
            this.temp1[i.key] = i.value
            if(i.type == 'select'){
                if(i.listType == 'custom'){
                    let res = (await utilsApi.businessFindAll()).data
                    for(let i of res){
                        i.value = i.code
                    }
                    i.list = res
                }else{
                    i.list = (await utilsApi.dictionaryFindPage({type:  i.listKey || i.key})).data.records
                }
            }
        }
    },
    methods: {
        formRules,
        searchObj() {
            let obj = {}
            for(let i of this.tradingChannel){
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
        let res = await utilsApi.agencyPage(Object.assign(data, this.searchObj()))
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
      handleCreate() {
        let user = JSON.parse(sessionStorage.getItem('user'))
        if(!user.is_auth){
          this.$notify({
                    title: '警告',
                    message: '请先去右上角绑定谷歌验证器，再进行该操作！',
                    type: 'warning',
                    duration: 2000
                })
            return
        }
        this.temp = {}
        this.dialogStatus = '新增'
        this.dialogFormVisible = true
        this.$nextTick(() => {
          this.$refs['dataForm'].clearValidate()
        })
      },
      businessAdd(){
        this.temp1 = {
            agencyCode: this.currentRow.code
        }
        this.dialogStatus1 = '新增'
        this.dialogFormVisible1 = true
        this.$nextTick(() => {
          this.$refs['dataForm1'].clearValidate()
        })
      },
      createData() {
        this.$refs['dataForm'].validate(async (valid) => {
          if (valid) {
            let data = JSON.parse(JSON.stringify(this.temp))
            delete data.id
            this.buttonLoading = true
            let res = await utilsApi.insertAgency(data)
            this.buttonLoading = false
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
      createData1() {
        this.$refs['dataForm1'].validate(async (valid) => {
          if (valid) {
            let data = JSON.parse(JSON.stringify(this.temp1))
            delete data.id
            this.buttonLoading = true
            let res = await utilsApi.agencyBusinessSave(data)
            this.buttonLoading = false
            if(res.code == 0){
                this.$notify({
                    title: '成功',
                    message: '创建成功',
                    type: 'success',
                    duration: 2000
                })
                this.findAgencyCode()
                this.dialogFormVisible1 = false
            }
          }
        })
      },
      handleUpdate(row) {
        let user = JSON.parse(sessionStorage.getItem('user'))
        if(!user.is_auth){
          this.$notify({
                    title: '警告',
                    message: '请先去右上角绑定谷歌验证器，再进行该操作！',
                    type: 'warning',
                    duration: 2000
                })
            return
        }
        this.temp = row
        this.dialogStatus = '编辑'
        this.dialogFormVisible = true
        this.$nextTick(() => {
          this.$refs['dataForm'].clearValidate()
        })
      },
      handleUpdate1(row) {
        this.temp1 = row
        this.dialogStatus1 = '编辑'
        this.dialogFormVisible1 = true
        this.$nextTick(() => {
          this.$refs['dataForm1'].clearValidate()
        })
      },
      updateData() {
        this.$refs['dataForm'].validate(async(valid) => {
          if (valid) {
            this.buttonLoading = true
            let res = await utilsApi.updateDictionary(this.temp)
            this.buttonLoading = false
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
      updateData1() {
        this.$refs['dataForm1'].validate(async(valid) => {
          if (valid) {
            this.buttonLoading = true
            let res = await utilsApi.agencyBusinessSave(this.temp1)
            this.buttonLoading = false
            if(res.code == 0){
                this.$notify({
                    title: '成功',
                    message: '更新成功',
                    type: 'success',
                    duration: 2000
                })
                this.findAgencyCode()
                this.dialogFormVisible1 = false
            }
          }
        })
      },
      async handleDelete(row, index) {
        this.$alert('确定删除该数据？', '删除', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
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
      async handleStatus(row,status){
        this.$alert(`确定${status == 'Y' ? '启用' : '禁用'}该通道？`, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
          callback: async action => {
            if(action != 'confirm'){
                return
            }
            let res = await utilsApi.updateStatusAgency({id: row.id,status})
            if(res.code == 0){
                this.$notify({
                    title: '成功',
                    message: `${status == 'Y' ? '启用' : '禁用'}成功`,
                    type: 'success',
                    duration: 2000
                })
                this.getList()
            }
          }
        });
      },
      async handleBusiness(row){
        this.type = 'business'
        this.listLoading = true
        this.currentRow = JSON.parse(JSON.stringify(row)) 
        this.temp1.agencyCode = row.code
        let res = await this.findAgencyCode()
        this.listLoading = false
      },
      async findAgencyCode() {
        let res = await utilsApi.findAgencyCode({code: this.currentRow.code})
        this.businessList = res.data
      }
    }
  }
  </script>
  