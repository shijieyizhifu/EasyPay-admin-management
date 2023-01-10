<template>
    <div class="app-container">
        <div v-if="type != 'channel'">
            <div class="filter-container">
                <search :searchFields='platformBusiness' @searchData='handleFilter' @addData='handleCreate'/>
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
                <el-table-column v-for="item,index in platformBusiness" :key="index" :label="item.label" :width="item.width || '120px'" align="center">
                    <template slot-scope="{row}">
                      <span v-if="item.type == 'select'">
                        {{ item.list.find(i => i.value == row[item.key]).name }}
                      </span>
                      <span v-else>{{ row[item.key] }}</span>
                    </template>
                  </el-table-column>
                <el-table-column :label="'操作'" fixed="right" align="center" width="230" class-name="small-padding fixed-width">
                  <template slot-scope="{row}">
                    <!-- <el-button type="success" v-if="row.status == 'N'" size="mini" @click="handleStatus(row,'Y')">
                        启用
                    </el-button>
                    <el-button type="danger" v-if="row.status == 'Y'" size="mini" @click="handleStatus(row,'N')">
                        禁用
                    </el-button> -->
                    <el-button type="success" size="mini" @click="handleUpdate(row)">
                        {{ $t('table.edit') }}
                      </el-button>
                    <el-button type="primary" size="mini" @click="handleBusiness(row)">
                        通道
                    </el-button>
                  </template>
                </el-table-column>
              </el-table>
          
              <pagination style="margin-top:0" v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.size" @pagination="getList" />
        </div>
        <div v-else>
            <el-table
                style="width:1001px"
                :key="1"
                v-loading="listLoading"
                :data="channelList"
                border
                fit
                highlight-current-row
              >
              <!-- @sort-change="sortChange" -->
                <el-table-column :label="$t('table.id')" type="index"  align="center" width="80" >
                </el-table-column>
                <el-table-column v-for="item,index in tradingChannelSim" :key="index" :label="item.label" :width="item.width || '120px'" align="center">
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
              </el-table>
              <el-row style="display:flex;justify-content:center;margin-top: 16px;">
                <el-button class="filter-item" style="margin-left: 10px;" type="primary"  @click="type = ''">
                  返回
                </el-button>
              </el-row>
        </div>
      <el-dialog :close-on-click-modal='false'  :close-on-press-escape='false' :title="dialogStatus" :visible.sync="dialogFormVisible">
        <el-form ref="dataForm" :model="temp" label-position="left" label-width="120px" style="width: 400px; margin-left:36px;">
            <div v-for="item,index in platformBusiness" :key="index">
                <el-form-item v-if="item.key != 'code'"  :label="item.label"  :prop="item.key" :required="item.required" :rules="formRules(item)">
                    <el-input v-if="!item.type" v-model="temp[item.key]" :disabled="dialogStatus==='编辑' && item.editDisabled" :placeholder="item.label"/>
                    <el-select  filterable v-if="item.type == 'select'" v-model="temp[item.key]" :placeholder="item.label">
                        <el-option v-for="(option,index) in item.list" :key="index" :label="option.name" :value="option.value"></el-option>
                      </el-select>
                </el-form-item>
            </div>
        </el-form>
        <div slot="footer" class="dialog-footer">
          <el-button @click="dialogFormVisible = false">
            {{ $t('table.cancel') }}
          </el-button>
          <el-button :loading="buttonLoading" type="primary" @click="dialogStatus==='新增'?createData():updateData()">
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
  import { platformBusiness, formRules, tradingChannelSim } from '@/utils/table'
  
  export default {
    name: 'PlatformBusiness',
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
        dialogStatus: '',
        textMap: {
          update: '编辑',
          create: '新增'
        },
        platformBusiness,
        tradingChannelSim,
        type: '',
        channelList: [],
        currentRow: {}
      }
    },
    async created() {
      for(let i of platformBusiness){
        this.temp[i.key] = i.value
        if(i.type == 'select'){
            i.list = (await utilsApi.dictionaryFindPage({type: i.listKey || i.key})).data.records
        }
      }
      this.getList()
      for(let i of tradingChannelSim){
            if(i.type == 'select'){
                i.list = (await utilsApi.dictionaryFindPage({type:  i.listKey || i.key})).data.records
            }
        }
    },
    methods: {
        formRules,
        searchObj() {
            let obj = {}
            for(let i of this.platformBusiness){
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
        let res = await utilsApi.businessPage(Object.assign(data, this.searchObj()))
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
        this.temp = {}
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
            this.buttonLoading = true
            let res = await utilsApi.insterBusiness(data)
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
            this.buttonLoading = true
            let res = await utilsApi.updateBusiness(this.temp)
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
        this.$alert(`确定${status == 'Y' ? '启用' : '禁用'}该业务？`, '提示', {
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
        this.type = 'channel'
        this.listLoading = true
        this.currentRow = JSON.parse(JSON.stringify(row)) 
        let res = await this.findAgencyBusiness()
        this.listLoading = false
      },
      async findAgencyBusiness() {
        let res = await utilsApi.findAgencyBusiness({code: this.currentRow.code})
        this.channelList = res.data
      }
    }
  }
  </script>
  