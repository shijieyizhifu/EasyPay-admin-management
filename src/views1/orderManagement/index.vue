<template>
    <div class="app-container">
      <div class="filter-container">
        <search :searchFields.sync='payOrder' :type="'pay'" @searchData='handleFilter' @addData='handleCreate'/>
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
        <el-table-column  label="创建时间" align="center" width="100" >
          <template slot-scope="{row}">
              <span >{{ moment(row.createdTime).format('YYYY/MM/DD HH:mm:ss') }}</span>
          </template>
      </el-table-column>
        <el-table-column prop="amount" label="金额" align="center" width="100" >
            <template slot-scope="{row}">
                <span >{{ row.amount + ' ' + row.currency }}</span>
                </template>
        </el-table-column>
        <el-table-column prop="payAmount" label="实际支付金额" align="center" width="120" >
            <template slot-scope="{row}">
                <span >{{ row.payAmount + ' ' + row.currency }}</span>
                </template>
        </el-table-column>
        <el-table-column prop="fee" label="手续费" align="center" width="100" >
            <template slot-scope="{row}">
                <span >{{ row.fee + ' ' + row.currency }}</span>
                </template>
        </el-table-column>
        <el-table-column prop="rate" label="费率" align="center" width="100" >
        </el-table-column>
        <template v-for="item,index in payOrder">
            <el-table-column  v-if="item.key != 'date'" :key="index" :label="item.label" :width="item.width || '100px'" align="center">
                <template slot-scope="{row}">
                    <!-- <div v-if="row[item.key] && row[item.key].length < 20 || !row[item.key]"> -->
                        <span v-if="item.type == 'select'">
                            <el-tag  v-if="row[item.key] == 'Y'" type="success" >{{ item.list.find(i => i.value == row[item.key]) ? item.list.find(i => i.value == row[item.key]).name : '' }}</el-tag>
                            <el-tag  v-else-if="row[item.key] == 'N'" type="danger" >{{ item.list.find(i => i.value == row[item.key]) ? item.list.find(i => i.value == row[item.key]).name : '' }}</el-tag>
                            <span v-else>{{ item.list.find(i => i.value == row[item.key]) ? item.list.find(i => i.value == row[item.key]).name : '' }}</span>
                        </span>
                        <span v-else>{{ row[item.key] == -1 ? '-' : row[item.key] }}</span>
                    <!-- </div>
                    <el-tooltip v-else class="item" effect="light" :content="row[item.key]" placement="right-start">
                        <span>{{ row[item.key].slice(0,7)+'...'}}</span>
                    </el-tooltip> -->
                </template>
            </el-table-column>
        </template>
        <el-table-column  label="更新时间" align="center" width="100" >
            <template slot-scope="{row}">
                <span >{{ moment(row.updatedTime).format('YYYY/MM/DD HH:mm:ss') }}</span>
            </template>
        </el-table-column>
        <el-table-column :label="'操作'" align="center" width="120" fixed="right" class-name="small-padding fixed-width">
          <template slot-scope="{row}">
            <el-button v-if="row.status == 'Y'" type="success" size="mini" @click="orderNotify(row)">
              补发通知
            </el-button>
            <div v-else-if="row.status == 'N'">
              <el-button  type="success" size="mini" @click="finishOrder(row)">
                处理成功
              </el-button>
            </div>
            <span v-else>-</span>
          </template>
        </el-table-column>
      </el-table>
  
      <pagination style="margin-top:0" v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.size" @pagination="getList" />
  
      <el-dialog :close-on-click-modal='false'  :close-on-press-escape='false' :title="dialogStatus" :visible.sync="dialogFormVisible">
        <el-form ref="dataForm" :model="temp" label-position="left" label-width="100px" style="width: 400px; margin-left:36px;">
            <el-form-item v-for="item,index in payOrder" :key="index" :label="item.label" :prop="item.key" :required="item.required" :rules="formRules(item)">
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
  import { payOrder, formRules} from '@/utils/table'
  
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
        payOrder,
        moment
      }
    },
    async created() {
      for(let i of payOrder){
        this.temp[i.key] = i.value
        if(i.type == 'select'){
          if(i.listType == 'custom' && i.key == 'businessName'){
              let res = (await utilsApi.businessFindAll({type: 'PAYOUT'})).data
              for(let i of res){
                  i.value = i.name
              }
              i.list = res
          }else if(i.listType == 'custom' && i.key == 'agencyCode'){
              let res = (await utilsApi.agencyFindAll()).data
              for(let i of res){
                  i.value = i.code
              }
              i.list = res
          }else{
            i.list = (await utilsApi.dictionaryFindPage({type: i.listKey || i.key})).data.records
          }
        }
      }
      this.getList()
    },
    methods: {
        formRules,
        searchObj() {
            let obj = {}
            for(let i of this.payOrder){
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
        let searchObj = JSON.parse(JSON.stringify(this.searchObj()))
        if(searchObj.date && searchObj.date.length > 0 && searchObj.date[0]){
            searchObj.startTime = new Date(searchObj.date[0]).getTime()
            searchObj.endTime = new Date(searchObj.date[1]).getTime()
            delete searchObj.date
        }
        let res = await utilsApi.orderPage(Object.assign(data, searchObj))
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
      orderNotify(row) {
        this.$alert('确定补发通知吗？', '通知', {
          confirmButtonText: '确定',
          callback: async action => {
            if(action != 'confirm'){
                return
            }
            let res = await utilsApi.orderNotify({id: row.id})
            if(res.code == 0){
                this.$notify({
                    title: '成功',
                    message: '补发通知成功',
                    type: 'success',
                    duration: 2000
                })
                this.getList()
            }
          }
        });
        // let user = JSON.parse(sessionStorage.getItem('user'))
        // if(!user.is_auth){
        //   this.$notify({
        //             title: '警告',
        //             message: '请先去右上角绑定谷歌验证器，再进行该操作！',
        //             type: 'warning',
        //             duration: 2000
        //         })
        //     return
        // }
        // this.$prompt('请输入谷歌验证码', '补发通知', {
        //   confirmButtonText: '确定',
        //   cancelButtonText: '取消',
        //   inputPattern: /^\d{6}$/,
        //   inputErrorMessage: '请输入谷歌验证码'
        // }).then(async ({ value }) => {
        //   let res = await utilsApi.orderNotify({id: row.id,verifCode: value})
        //     if(res.code == 0){
        //         this.$notify({
        //             title: '成功',
        //             message: '补发通知成功',
        //             type: 'success',
        //             duration: 2000
        //         })
        //     }
        // })
      },
      finishOrder(row,status) {
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
        this.$prompt('请输入谷歌验证码', '处理成功订单', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          inputPattern: /^\d{6}$/,
          inputErrorMessage: '请输入谷歌验证码'
        }).then(async ({ value }) => {
          let res = await utilsApi.finishOrder({id: row.id,verifCode: value})
            if(res.code == 0){
                this.$notify({
                    title: '成功',
                    message: '处理订单成功',
                    type: 'success',
                    duration: 2000
                })
                this.getList()
            }
        })
      }
    }
  }
  </script>
  