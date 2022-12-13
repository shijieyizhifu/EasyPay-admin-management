<template>
    <div class="app-container">
      <div class="filter-container">
        <search :searchFields.sync='backUList' :type="'MerchantOffline'" @searchData='handleFilter' />
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
        <template v-for="item,index in backUList">
            <el-table-column  v-if="item.key != 'date'" :key="index" :label="item.label" :width="item.width || '100px'" align="center">
                <template slot-scope="{row}">
                    <!-- <div v-if="row[item.key] && (row[item.key]+'').length < 20 || !row[item.key]"> -->
                        <span v-if="item.type == 'select'">
                            <el-tag effect="dark" v-if="row[item.key] == 'success'" type="success" >{{ item.list.find(i => i.value == row[item.key]) ? item.list.find(i => i.value == row[item.key]).name : '' }}</el-tag>
                            <el-tag effect="dark" v-else-if="row[item.key] == 'fail'" type="danger" >{{ item.list.find(i => i.value == row[item.key]) ? item.list.find(i => i.value == row[item.key]).name : '' }}</el-tag>
                            <el-tag effect="dark" type="primary" v-else>{{ item.list.find(i => i.value == row[item.key]) ? item.list.find(i => i.value == row[item.key]).name : '' }}</el-tag>
                        </span>
                        <span v-else>{{ !row[item.key] ? '-' : row[item.key] }}</span>
                    <!-- </div> -->
                    <!-- <el-tooltip v-else class="item" effect="light" :content="row[item.key]" placement="right-start">
                        <span>{{ row[item.key].slice(0,7)+'...'}}</span>
                    </el-tooltip> -->
                </template>
            </el-table-column>
        </template>
        <el-table-column  label="创建时间" align="center" width="160" >
            <template slot-scope="{row}">
                <span >{{ moment(row.createdTime).format('YYYY/DD/MM HH:mm:ss') }}</span>
            </template>
        </el-table-column>
        <el-table-column  :label="'操作'" align="center" width="280" class-name="small-padding fixed-width">
          <template slot-scope="{row}">
            <template v-if="row.status=='apply'">
                <el-button type="success" size="mini" @click="handleUpdateOffline(row,true)">
                    通过
                  </el-button>
                  <el-button  size="mini" type="warning" @click="handleUpdateOffline(row,false)">
                    驳回
                  </el-button>
            </template>
            <el-button v-if="row.agencyImageUrl"  size="mini" type="success" @click="handleBackUImg(row,'agencyImageUrl')">
                查看上游回U证明
            </el-button>
            <el-button v-if="row.merchantImageUrl"  size="mini" type="success" @click="handleBackUImg(row,'merchantImageUrl')">
                查看商户回U证明
            </el-button>
            <span v-if="row.status!='apply' && !row.agencyImageUrl && !row.merchantImageUrl">-</span>
          </template>
        </el-table-column>
      </el-table>
  
      <pagination style="margin-top:0" v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.size" @pagination="getList" />
  
      <el-dialog :title="'通过回U申请'" :visible.sync="dialogFormVisible">
        <el-form ref="dataForm" :model="temp" :rules="rules" label-position="left" label-width="120px" style="width: 400px; margin-left:36px;">
            <el-form-item  label="上游U的费率" prop="agencyUsdtRate">
              <el-input v-model="temp.agencyUsdtRate" placeholder="上游U的费率"/>
            </el-form-item>
            <el-form-item  label="U的费率" prop="merchantUsdtRate">
                <el-input v-model="temp.merchantUsdtRate" placeholder="U的费率"/>
            </el-form-item>
            <el-form-item  label="收款（U）" prop="actualReceive">
                <el-input v-model="temp.actualReceive" placeholder="收款（U）"/>
            </el-form-item>
            <el-form-item  label="付款（U）" prop="actualPayment">
                <el-input v-model="temp.actualPayment" placeholder="付款（U）"/>
            </el-form-item>
            <el-form-item  label="利润（U）"  prop="profit">
                <el-input v-model="temp.profit" placeholder="利润（U）"/>
            </el-form-item>
            <el-form-item  label="通道商户" prop="agencyCode">
                <el-select v-model="temp.agencyCode" class="filter-item" placeholder="通道商户">
                    <el-option v-for="item in agencyList" :key="item.name" :label="item.name" :value="item.code" />
                  </el-select>
            </el-form-item>
            <el-form-item  label="上游回U证明" required>
                <el-upload
                    ref="upload"
                    :headers="headers"
                    class="upload-demo"
                    :action="actionUrl"
                    :file-list="fileList"
                    :on-success="uploadSuccess"
                    :on-remove="uploadRemove"
                    :on-error="uploadError"
                    :limit="1"
                    list-type="picture">
                    <el-button size="small" type="primary">点击上传</el-button>
                    <div slot="tip" class="el-upload__tip">只能上传图片文件</div>
                </el-upload>
            </el-form-item>
            <el-form-item  label="商户回U证明" required>
              <el-upload
                  ref="upload1"
                  :headers="headers"
                  class="upload-demo"
                  :action="actionUrl"
                  :file-list="fileList1"
                  :on-success="uploadSuccess1"
                  :on-remove="uploadRemove1"
                  :on-error="uploadError"
                  :limit="1"
                  list-type="picture">
                  <el-button size="small" type="primary">点击上传</el-button>
                  <div slot="tip" class="el-upload__tip">只能上传图片文件</div>
              </el-upload>
          </el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer">
          <el-button @click="dialogFormVisible = false">
            {{ $t('table.cancel') }}
          </el-button>
          <el-button type="primary" :loading="buttonLoading" @click="confirmUpdateOffline">
            {{ $t('table.confirm') }}
          </el-button>
        </div>
      </el-dialog>

      <el-dialog :title="'回U证明'" :visible.sync="imgDialog"  center width="408px">
        <img
          width="360"
          :src="imgUrl"/>
        <div slot="footer">
            <el-button @click="imgDialog = false" >
              关闭
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
  import { backUList, formRules} from '@/utils/table'
  
  export default {
    name: 'MerchantOffline',
    components: { Pagination, Search },
    data() {
      return {
        headers: {'X-Token': localStorage.getItem('token')},
        actionUrl: utilsApi.uploadImgUrl,
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
        backUList,
        moment,
        agencyList: [],
        buttonLoading: false,
        fileList: [],
        fileList1: [],
        rules: {
            agencyUsdtRate: [{ required: true, message: '请输入上游U的费率', trigger: 'blur' }],
            merchantUsdtRate: [{ required: true, message: '请输入U的费率', trigger: 'blur' }],
            actualReceive: [{ required: true, message: '请输入收款（U）', trigger: 'blur' }],
            actualPayment: [{ required: true, message: '请输入付款（U）', trigger: 'blur' }],
            profit: [{ required: true, message: '请输入利润（U）', trigger: 'blur' }],
            agencyCode: [{ required: true, message: '请选择通道商户', trigger: 'change' }],
        },
        imgDialog: false,
        imgUrl: ''
      }
    },
    async created() {
      for(let i of backUList){
        this.temp[i.key] = i.value
        if(i.type == 'select'){
            i.list = (await utilsApi.dictionaryFindPage({type: i.listKey || i.key})).data.records
        }
      }
      this.getList()
      this.findAgencyList()
    },
    methods: {
        uploadSuccess(response, file, fileList) {
            this.fileList = fileList
        },
        uploadRemove(file, fileList) {
            this.fileList = fileList
        },
        uploadSuccess1(response, file, fileList) {
            this.fileList1 = fileList
        },
        uploadRemove1(file, fileList) {
            this.fileList1 = fileList
        },
        uploadError(err, file, fileList) {
            this.$notify({
                title: '失败',
                message: '上传失败！',
                type: 'danger',
                duration: 2000
            })
        },
        findAgencyList() {
            utilsApi.agencyFindAll().then((res)=>{
                if(res.code == 0){
                    this.agencyList = res.data
                }
            })
        },
        formRules,
        searchObj() {
            let obj = {}
            for(let i of this.backUList){
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
        let res = await utilsApi.merchantOfflinePage(Object.assign(data, searchObj))
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
      confirmUpdateOffline() {
        if(this.fileList.length <=0){
            this.$notify({
                    title: '警告',
                    message: '请上传上游回U证明！',
                    type: 'warning',
                    duration: 2000
                })
            return
        }
        if(this.fileList1.length <=0){
            this.$notify({
                    title: '警告',
                    message: '请上传商户回U证明！',
                    type: 'warning',
                    duration: 2000
                })
            return
        }
        this.$refs['dataForm'].validate(async (valid) => {
          if (valid) {
            let data = JSON.parse(JSON.stringify(this.temp))
            data.id = this.currentRow.id
            data.status = 'success'
            data.agencyImageUrl = this.fileList[0].response.data
            data.merchantImageUrl = this.fileList1[0].response.data
            this.buttonLoading = true
            let res = await utilsApi.updateOffline(data)
            this.buttonLoading = false
            if(res.code == 0){
                this.$notify({
                    title: '成功',
                    message: '通过成功',
                    type: 'success',
                    duration: 2000
                })
                this.getList()
                this.dialogFormVisible = false
            }
          }
        })
      },
      handleUpdateOffline(row, flag) {
        if(flag){
            this.currentRow = row
            this.temp = {}
            this.dialogFormVisible = true
            this.$nextTick(() => {
                this.$refs['dataForm'].clearValidate()
                this.$refs['upload'].clearFiles()
                this.$refs['upload1'].clearFiles()
            })
        }else{
            this.$alert('确定驳回该商户的回U申请吗？', '驳回', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning',
                callback: async action => {
                    if(action != 'confirm'){
                        return
                    }
                    let data = {
                        id: row.id,
                        status: 'fail'
                    }
                    this.buttonLoading = true
                    let res = await utilsApi.updateOffline(data)
                    this.buttonLoading = false
                    if(res.code == 0){
                        this.$notify({
                            title: '成功',
                            message: '驳回成功',
                            type: 'success',
                            duration: 2000
                        })
                        this.dialogFormVisible2 = false
                        this.getList()
                    }
                }
            });
        }
      },
      handleBackUImg(row,key) {
        this.imgDialog = true
        this.imgUrl = utilsApi.imgUrl + row[key]
      }
    }
  }
  </script>
  