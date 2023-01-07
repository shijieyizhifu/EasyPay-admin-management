<template>
    <div class="app-container">
      <div class="filter-container">
        <search :searchFields.sync='fundsList' :type="'FundsRecords'" @searchData='handleFilter' />
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
        <el-table-column prop="amount" label="金额" align="center" width="160" >
            <template slot-scope="{row}">
                <el-tag  v-if="row.type == 'UNFREEZE'" type="success" round>{{ `解冻 ${row.amount+' '+ row.currency}` }}</el-tag>
                <el-tag  v-else type="danger" round>{{ `冻结 ${row.amount+' '+ row.currency}` }}</el-tag>
            </template>
        </el-table-column>
        <el-table-column v-for="item,index in fundsList" :key="index" :label="item.label" :width="item.width || '120px'" align="center">
            <template slot-scope="{row}">
                <span v-if="item.type == 'select'">
                    {{ item.list.find(i => i.value == row[item.key]).name }}
                  </span>
                  <span v-else>{{ row[item.key] }}</span>
            </template>
          </el-table-column>
          <el-table-column  label="创建时间" align="center" width="100" >
            <template slot-scope="{row}">
                <span >{{ moment(row.createdTime).format('YYYY/MM/DD HH:mm:ss') }}</span>
            </template>
        </el-table-column>
        <el-table-column :label="'操作'" align="center" fixed="right" width="120" class-name="small-padding fixed-width">
          <template slot-scope="{row}">
            <el-button v-if="row.type == 'UNFREEZE' && row.status == 'N'" type="primary" size="mini" @click="unfreeze(row)">
                解冻审核
            </el-button>
            <span v-else>-</span>
          </template>
        </el-table-column>
      </el-table>
  
      <pagination style="margin-top:0" v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.size" @pagination="getList" />
    
        <el-dialog :title="`解冻审核`" :visible.sync="dialogFormVisible" center>
          <el-form ref="dataForm" :model="temp" :rules="rules" label-position="left" label-width="140px" style="width: 400px; margin-left:36px;">
            <el-form-item :label="'邮箱验证码'" prop="emailCode" class="emailCode">
              <el-input  v-model="temp.emailCode" placeholder="邮箱验证码">
                <template slot="append">
                  <el-button type="primary" :disabled="disabledSendCode" :loading="codeLoading"  @click="sendCode">
                    {{ disabledSendCode ? countdown + 's' : '发送验证码' }}
                  </el-button>
                </template>
              </el-input>
            </el-form-item>  
            <el-form-item :label="'谷歌验证码'" prop="verifCode">
                  <el-input  v-model="temp.verifCode" placeholder="谷歌验证码"/>
            </el-form-item>
          </el-form>
          <div slot="footer" class="dialog-footer">
              <el-button @click="dialogFormVisible = false">
                {{ $t('table.cancel') }}
              </el-button>
              <el-button type="primary" :loading="buttonLoading" @click="confirm">
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
  import { fundsList } from '@/utils/table'
  
  export default {
    name: 'FundsRecords',
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
        fundsList,
        moment,
        buttonLoading: false,
        currentRow: {},
        rules: {
          verifCode: [{ required: true, message: '请输入谷歌验证码', trigger: 'blur' }],
          emailCode: [{ required: true, message: '请输入邮箱验证码', trigger: 'blur' }],
        },
        disabledSendCode: false,
        countdown: 60,
        codeLoading: false
      }
    },
    async created() {
      for(let i of fundsList){
            if(i.type == 'select'){
                i.list = (await utilsApi.dictionaryFindPage({type:  i.listKey || i.key})).data.records
            }
      }
      this.getList()
    },
    methods: {
        searchObj() {
            let obj = {}
            for(let i of this.fundsList){
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
        let res = await utilsApi.accountPage(Object.assign(data, this.searchObj()))
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
      unfreeze(row) {
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
        this.currentRow = row
        this.dialogFormVisible = true
        this.temp = {
          verifCode: undefined,
          emailCode: undefined
        }
        this.$nextTick(() => {
          this.$refs['dataForm'].clearValidate()
        })
      },
      confirm() {
        this.$refs['dataForm'].validate(async (valid) => {
          if (valid) {
            this.buttonLoading = true
            let res = await utilsApi.accountReview({id: this.currentRow.id,verifCode: this.temp.verifCode,emailCode: this.temp.emailCode})
            this.buttonLoading = false
            this.dialogFormVisible = false
            if(res.code == 0){
                this.$notify({
                    title: '成功',
                    message: '审核成功',
                    type: 'success',
                    duration: 2000
                })
                this.getList()
            }
          }
        })
      },
      async sendCode() {
        this.codeLoading = true
        let res = await utilsApi.sendCode({type: `解冻审核`})
        this.codeLoading = false
        this.disabledSendCode = true 
        if(res.code == 0) {
          this.countdown = 60
          this.interval = setInterval(() => {
            if(this.countdown == 0){
              clearInterval(this.interval)
              this.disabledSendCode = false 
            }else{
              this.countdown -= 1
            }
          }, 1000);
        }else{
          clearInterval(this.interval)
          this.disabledSendCode = false 
        }
      }
    }
  }
  </script>
  