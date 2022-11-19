<template>
    <div class="app-container">
      <div class="filter-container">
        <el-input v-model="listQuery.salesman" :placeholder="'业务员名'" style="width: 200px;" class="filter-item" @keyup.enter.native="handleFilter" />
        <el-button style="margin-left: 10px;" v-waves class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">
          {{ $t('table.search') }}
        </el-button>
        <el-button class="filter-item" style="margin-left: 10px;" type="primary" icon="el-icon-edit" @click="handleCreate">
          {{ $t('table.add') }}
        </el-button>
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
        <el-table-column :label="'日期'" width="150px" align="center">
          <template slot-scope="{row}">
            <span>{{ row.date | parseTime('{y}-{m}-{d}') }}</span>
          </template>
        </el-table-column>
        <el-table-column :label="'创建时间'" width="160px" align="center">
            <template slot-scope="{row}">
              <span>{{ row.createdTime }}</span>
            </template>
          </el-table-column>
        <el-table-column :label="'业务员'" width="110px" align="center">
          <template slot-scope="{row}">
            <span>{{ row.salesman }}</span>
          </template>
        </el-table-column>
        <el-table-column  :label="'国家'" width="110px" align="center">
          <template slot-scope="{row}">
            <span >{{ row.country }}</span>
          </template>
        </el-table-column>
        <el-table-column  :label="'出/入'" width="110px" align="center">
            <template slot-scope="{row}">
                <span >{{ getLabelType(row.type) }}</span>
            </template>
        </el-table-column>
        <el-table-column  :label="'金额'" width="110px" align="center">
            <template slot-scope="{row}">
                <span >{{ row.amount }}</span>
            </template>
        </el-table-column>
        <el-table-column  :label="'费率'" width="110px" align="center">
            <template slot-scope="{row}">
                <span >{{ row.rate }}</span>
            </template>
        </el-table-column>
        <el-table-column  :label="'成本'" width="110px" align="center">
            <template slot-scope="{row}">
                <span >{{ row.cost }}</span>
            </template>
        </el-table-column>
        <el-table-column  :label="'回U汇率'" width="110px" align="center">
            <template slot-scope="{row}">
                <span >{{ row.usdtRate }}</span>
            </template>
        </el-table-column>
        <el-table-column  :label="'实收'" width="110px" align="center">
            <template slot-scope="{row}">
                <span >{{ row.actualPayment }}</span>
            </template>
        </el-table-column>
        <el-table-column  :label="'实付'" width="110px" align="center">
            <template slot-scope="{row}">
                <span >{{ row.actualReceive }}</span>
            </template>
        </el-table-column>
        <el-table-column  :label="'利润'" width="110px" align="center">
            <template slot-scope="{row}">
                <span >{{ row.profit }}</span>
            </template>
        </el-table-column>
        <el-table-column  :label="'上游'" width="110px" align="center">
            <template slot-scope="{row}">
                <span >{{ row.upstream }}</span>
            </template>
        </el-table-column>
        <el-table-column  :label="'是否结算'" width="110px" align="center">
            <template slot-scope="{row}">
                <span >{{ getLabelStatus(row.status) }}</span>
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
        <el-form ref="dataForm" :rules="rules" :model="temp" label-position="left" label-width="70px" style="width: 400px; margin-left:50px;">
            <el-form-item :label="'日期'" prop="date">
                <el-date-picker v-model="temp.date" type="date" placeholder="日期" />
            </el-form-item>
            <el-form-item :label="'业务员'" prop="salesman">
                <el-input v-model="temp.salesman" />
            </el-form-item>
            <el-form-item :label="'国家'" prop="country">
                <el-input v-model="temp.country" />
            </el-form-item>
            <el-form-item :label="'类型'" prop="type">
                <el-select v-model="temp.type" class="filter-item" placeholder="类型">
                  <el-option v-for="item in offlineRecordType" :key="item.label" :label="item.label" :value="item.value" />
                </el-select>
              </el-form-item>
            <el-form-item :label="'金额'" prop="amount">
                <el-input v-model="temp.amount" />
            </el-form-item>
            <el-form-item :label="'费率'" prop="rate">
                <el-input v-model="temp.rate" />
            </el-form-item>
            <el-form-item :label="'成本'" prop="cost">
                <el-input v-model="temp.cost" />
            </el-form-item>
            <el-form-item :label="'回U费率'" label-width="100px" prop="usdtRate">
                <el-input v-model="temp.usdtRate" />
            </el-form-item>
            <el-form-item :label="'实付'" prop="actualReceive">
                <el-input v-model="temp.actualReceive" />
            </el-form-item>
            <el-form-item :label="'实收'" prop="actualPayment">
                <el-input v-model="temp.actualPayment" />
            </el-form-item>
            <el-form-item :label="'利润'" prop="profit">
                <el-input v-model="temp.profit" />
            </el-form-item>
            <el-form-item :label="'上游'" prop="upstream">
                <el-input v-model="temp.upstream" />
            </el-form-item>
            <el-form-item :label="'是否结算'" label-width="100px" prop="status">
                <el-select v-model="temp.status" class="filter-item" placeholder="">
                  <el-option v-for="item in offlineRecordStatus" :key="item.label" :label="item.label" :value="item.value" />
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
  import { offlineRecordType, offlineRecordStatus } from '@/utils/selectList'
  import moment from 'moment'
  
  const calendarTypeOptions = [
    { key: 'CN', display_name: 'China' },
    { key: 'US', display_name: 'USA' },
    { key: 'JP', display_name: 'Japan' },
    { key: 'EU', display_name: 'Eurozone' }
  ]
  
  // arr to obj, such as { CN : "China", US : "USA" }
  const calendarTypeKeyValue = calendarTypeOptions.reduce((acc, cur) => {
    acc[cur.key] = cur.display_name
    return acc
  }, {})

  export default {
    name: 'OfflineRecord',
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
          salesman: undefined,
        },
        importanceOptions: [1, 2, 3],
        calendarTypeOptions,
        statusOptions: ['published', 'draft', 'deleted'],
        showReviewer: false,
        temp: {
            date: undefined, 
            salesman: undefined, 
            country: undefined,
            type: undefined,
            amount: undefined,
            rate: undefined,
            cost: undefined,
            usdtRate: undefined,
            actualReceive: undefined,
            actualPayment: undefined,
            profit: undefined,
            upstream: undefined, 
            status: undefined,
        },
        dialogFormVisible: false,
        dialogStatus: '',
        textMap: {
          update: '编辑',
          create: '新增'
        },
        pvData: [],
        rules: {
            date: [{ type: 'date' || 'string', required: true, message: '请选择日期', trigger: 'change' }],
            salesman: [{ required: true, message: '请输入业务员', trigger: 'blur' }],
            country: [{ required: true, message: '请输入国家', trigger: 'blur' }],
            type: [{ required: true, message: '请选择类型', trigger: 'change' }],
            amount: [{ required: true, message: '请输入金额', trigger: 'blur' }],
            rate: [{ required: true, message: '请输入费率', trigger: 'blur' }],
            cost: [{ required: true, message: '请输入成本', trigger: 'blur' }],
            usdtRate: [{ required: true, message: '请输入回U汇率', trigger: 'blur' }],
            actualReceive: [{ required: true, message: '请输入实付', trigger: 'blur' }],
            actualPayment: [{ required: true, message: '请输入实收', trigger: 'blur' }],
            profit: [{ required: true, message: '请输入利润', trigger: 'blur' }],
            upstream: [{ required: true, message: '请输入上游', trigger: 'blur' }],
            status: [{ required: true, message: '请选择状态', trigger: 'change' }],
        },
        offlineRecordType, offlineRecordStatus
      }
    },
    created() {
      this.getList()
    },
    methods: {
      getLabelType(value) {
        for(let i of this.offlineRecordType) {
            if(i.value == value) {
                return i.label
            }
        }
        return ''
      },
      getLabelStatus(value) {
        for(let i of this.offlineRecordStatus) {
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
            salesman: this.listQuery.salesman
        }
        let res = await utilsApi.offlineRecordPage(data)
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
      handleModifyStatus(row, status) {
        this.$message({
          message: '操作成功',
          type: 'success'
        })
        row.status = status
      },
      sortChange(data) {
        const { prop, order } = data
        if (prop === 'id') {
          this.sortByID(order)
        }
      },
      sortByID(order) {
        if (order === 'ascending') {
          this.listQuery.sort = '+id'
        } else {
          this.listQuery.sort = '-id'
        }
        this.handleFilter()
      },
      resetTemp() {
        this.temp = {
            date: Date.now(), 
            salesman: undefined, 
            country: undefined,
            type: undefined,
            amount: undefined,
            rate: undefined,
            cost: undefined,
            usdtRate: undefined,
            actualReceive: undefined,
            actualPayment: undefined,
            profit: undefined,
            upstream: undefined, 
            status: undefined,
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
            data.date = moment(data.date).format('YYYY-MM-DD HH:mm:ss')
            let res = await utilsApi.offlineRecordSave(data)
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
        this.temp.date = new Date(this.temp.date)
        this.dialogStatus = '编辑'
        this.dialogFormVisible = true
        this.$nextTick(() => {
          this.$refs['dataForm'].clearValidate()
        })
      },
      updateData() {
        this.$refs['dataForm'].validate(async(valid) => {
          if (valid) {
            let data = JSON.parse(JSON.stringify(this.temp))
            data.date = moment(data.date).format('YYYY-MM-DD HH:mm:ss')
            let res = await utilsApi.offlineRecordUpdate(data)
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
            let res = await utilsApi.offlineRecordDel({id: row.id})
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
      handleDownload() {
        this.downloadLoading = true
        import('@/vendor/Export2Excel').then(excel => {
          const tHeader = ['timestamp', 'title', 'type', 'importance', 'status']
          const filterVal = ['timestamp', 'title', 'type', 'importance', 'status']
          const data = this.formatJson(filterVal)
          excel.export_json_to_excel({
            header: tHeader,
            data,
            filename: 'table-list'
          })
          this.downloadLoading = false
        })
      },
      formatJson(filterVal) {
        return this.list.map(v => filterVal.map(j => {
          if (j === 'timestamp') {
            return parseTime(v[j])
          } else {
            return v[j]
          }
        }))
      },
      getSortClass: function(key) {
        const sort = this.listQuery.sort
        return sort === `+${key}` ? 'ascending' : 'descending'
      }
    }
  }
  </script>
  