<template>
    <div class="app-container">
        <div v-if="type != 'clusterMerchant'">
            <div class="filter-container">
                <el-card header="查询条件">
                    <el-form :inline="true" label-width="120px">
                        <el-form-item label="名称">
                            <el-input style="width:183px;" v-model="searchObj.name" placeholder="请输入名称"></el-input>
                        </el-form-item>
                        <el-form-item label="商户号">
                          <el-input style="width:183px;" v-model="searchObj.merchantCode" placeholder="请输入商户号"></el-input>
                      </el-form-item>
                        <el-form-item label="业务名称">
                            <el-select style="width:183px;" v-model="searchObj.businessCode" placeholder="请选择">
                              <el-option v-for="item in allBuinessList" :key="item.code" :label="item.name" :value="item.code" />
                            </el-select>
                        </el-form-item>
                    </el-form>
                    <el-row style="display:flex;justify-content:center;">
                    <el-button style="margin-left: 10px;"  class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">
                        {{ $t('table.search') }}
                    </el-button>
                    <el-button  class="filter-item" style="margin-left: 10px;" type="success" icon="el-icon-edit" @click="handleCreate">
                        {{ $t('table.add') }}
                    </el-button>
                    </el-row>
                </el-card>
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
                <el-table-column prop="name" label="集群名称" align="center" width="100" >
                </el-table-column>
                <el-table-column prop="businessCode" label="业务编码" align="center" width="100" >
                </el-table-column>
                <el-table-column prop="businessName" label="业务名称" align="center" width="100" >
                </el-table-column>
                <el-table-column prop="businessType" label="业务类型" align="center" width="100" >
                    <template slot-scope="{row}">
                        <span v-if="row.businessType == 'PAY'">代收</span>
                        <span v-else>代付</span>
                    </template>
                </el-table-column>
                <el-table-column prop="agencyCode" label="通道编码" align="center" width="100" >
                </el-table-column>
                <el-table-column prop="agencyCode" label="通道编码" align="center" width="100" >
                </el-table-column>
                <el-table-column prop="agencyMerchant" label="机构商户" align="center" width="100" >
                </el-table-column>
                <el-table-column  label="创建时间" align="center" width="160" >
                    <template slot-scope="{row}">
                        <span >{{ moment(row.createdTime).format('YYYY/MM/DD HH:mm:ss') }}</span>
                    </template>
                </el-table-column>
                <el-table-column :label="'操作'" fixed="right" align="center" width="240" class-name="small-padding fixed-width">
                  <template slot-scope="{row}">
                    <!-- <el-button type="success" v-if="row.status == 'N'" size="mini" @click="handleStatus(row,'Y')">
                        启用
                    </el-button>
                    <el-button type="danger" v-if="row.status == 'Y'" size="mini" @click="handleStatus(row,'N')">
                        禁用
                    </el-button> -->
                    <el-button type="danger" size="mini" @click="handleDelete(row)">
                      删除
                    </el-button>
                    <el-button type="success" size="mini" @click="handleUpdate(row)">
                        {{ $t('table.edit') }}
                    </el-button>
                    <el-button type="primary" size="mini" @click="handleClusterMerchant(row)">
                        集群商户
                    </el-button>
                  </template>
                </el-table-column>
              </el-table>
          
              <pagination style="margin-top:0" v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.size" @pagination="getList" />
        </div>
        <div v-else>
            <div class="filter-container">
                <el-card header="查询条件">
                    <el-form :inline="true" label-width="120px">
                        <el-form-item label="商户编码">
                            <el-input style="width:183px;" v-model="searchObj1.merchantCode" placeholder="请输入商户编码"></el-input>
                        </el-form-item>
                        <el-form-item label="商户名称">
                            <el-input style="width:183px;" v-model="searchObj1.merchantName" placeholder="请输入商户名称"></el-input>
                        </el-form-item>
                    </el-form>
                    <el-row style="display:flex;justify-content:center;">
                    <el-button style="margin-left: 10px;" size="mini"  class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">
                        {{ $t('table.search') }}
                    </el-button>
                    <el-button  class="filter-item" size="mini" style="margin-left: 10px;" type="success" icon="el-icon-edit" @click="handleCreate1">
                        新增集群商户    
                    </el-button>
                    <el-button  class="filter-item" size="mini" style="margin-left: 10px;" type="danger" icon="el-icon-edit" @click="handleReset">
                        重置集群商户    
                    </el-button>
                    <el-button class="filter-item" size="mini" style="margin-left: 10px;" type="primary"  @click="handleClusterMerchant">
                        返回
                      </el-button>
                    </el-row>
                </el-card>
              </div>
          
              <el-table
                style="width:661px"
                :key="2"
                v-loading="listLoading"
                :data="list"
                border
                fit
                highlight-current-row
              >
              <!-- @sort-change="sortChange" -->
                <el-table-column :label="$t('table.id')" type="index"  align="center" width="80" >
                </el-table-column>
                <el-table-column prop="businessCode" label="业务编码" align="center" width="100" >
                </el-table-column>
                <el-table-column prop="merchantName" label="商户名称" align="center" width="100" >
                </el-table-column>
                <el-table-column prop="merchantCode" label="商户编码" align="center" width="100" >
                </el-table-column>
                <el-table-column  label="创建时间" align="center" width="160" >
                    <template slot-scope="{row}">
                        <span >{{ moment(row.createdTime).format('YYYY/MM/DD HH:mm:ss') }}</span>
                    </template>
                </el-table-column>
                <el-table-column :label="'操作'"  align="center" width="120" class-name="small-padding fixed-width">
                  <template slot-scope="{row}">
                    <!-- <el-button type="success" v-if="row.status == 'N'" size="mini" @click="handleStatus(row,'Y')">
                        启用
                    </el-button>
                    <el-button type="danger" v-if="row.status == 'Y'" size="mini" @click="handleStatus(row,'N')">
                        禁用
                    </el-button> -->
                    <el-button type="danger" size="mini" @click="handleDelete1(row)">
                        删除
                    </el-button>
                  </template>
                </el-table-column>
              </el-table>
          
              <pagination style="margin-top:0" v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.size" @pagination="getList" />
        </div>
      <el-dialog :close-on-click-modal='false'  :close-on-press-escape='false' :title="dialogStatus" :visible.sync="dialogFormVisible">
        <el-form ref="dataForm" :model="temp" :rules="clusterRules" label-position="left" label-width="120px" style="width: 400px; margin-left:36px;">
            <el-form-item :label="'集群名称'" prop="name">
                <el-input style="width:198px;" v-model="temp.name" placeholder="集群名称"/>
            </el-form-item>
            <el-form-item v-if="dialogStatus==='新增'" :label="'业务'" prop="businessCode">
                <el-select v-model="temp.businessCode" class="filter-item" placeholder="业务">
                  <el-option v-for="item in allBuinessList" :key="item.name" :label="item.name" :value="item.code" />
                </el-select>
              </el-form-item>
            <el-form-item v-if="dialogStatus==='新增'"  :label="'通道&商户'" required>
                <el-select v-if="showCascader && dialogStatus == '编辑'" style="width:198px;" :value="temp.agencyCode+'/'+temp.agencyMerchant" @click.native="showCascader=false"/>
                <el-cascader ref="cascader" v-else  :props="props" ></el-cascader>
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
      <el-dialog :close-on-click-modal='false'  :close-on-press-escape='false' :title="dialogStatus1" :visible.sync="dialogFormVisible1">
        <el-form ref="dataForm1" :model="temp1" :rules="clusterRules1" label-position="left" label-width="120px" style="width: 400px; margin-left:36px;">
            <el-form-item :label="'商户'" prop="merchantCode">
                <el-select v-model="temp1.merchantCode" class="filter-item" placeholder="商户">
                  <el-option v-for="item in nowBind" :key="item.merchantCode" :label="item.merchantName" :value="item.merchantCode" />
                </el-select>
              </el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer">
          <el-button @click="dialogFormVisible = false">
            {{ $t('table.cancel') }}
          </el-button>
          <el-button type="primary" :loading="buttonLoading" @click="dialogStatus1==='新增'?createData1():updateData1()">
            {{ $t('table.confirm') }}
          </el-button>
        </div>
      </el-dialog>
      <el-dialog :close-on-click-modal='false'  :close-on-press-escape='false' title="重置集群商户" :visible.sync="dialogFormVisible2" width="720px">
        <div >
            <el-transfer
                filterable
                :filter-method="filterMethod"
                filter-placeholder="请输入商户名称或者编码"
                :titles="['可绑定商户','已绑定商户']"
                v-model="merchantCodeList"
                :props="{
                    key: 'merchantCode',
                    label: 'label'
                  }"
                :data="allClusterMerchant">
            </el-transfer>
        </div>
        <div slot="footer" class="dialog-footer">
          <el-button @click="dialogFormVisible2 = false">
            {{ $t('table.cancel') }}
          </el-button>
          <el-button type="primary" :loading="buttonLoading" @click="resetClusterMerchant">
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
  
  export default {
    name: 'Agent',
    components: { Pagination },
    data() {
      return {
        moment,
        searchObj: {
            name: '',
            businessCode: '',
            merchantCode: ''
        },
        searchObj1: {
            clusterId: '',
            merchantName: '',
            merchantCode: ''
        },
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
        type: '',
        temp1: {},
        currentRow: {},
        props: {
          lazy: true,
          lazyLoad: this.lazyLoad
        },
        showCascader: true,
        allBuinessList:[],
        clusterRules: {
            name: [{ required: true, message: '请输入名称', trigger: 'blur' }],
            businessCode: [{ required: true, message: '请选择业务', trigger: 'change' }],
        },
        nowBind: [],
        bind: [],
        clusterRules1: {
            merchantCode: [{ required: true, message: '请选择商户', trigger: 'change' }],
        },
        dialogFormVisible2: false,
        filterMethod(query, item) {
          return item.merchantName.indexOf(query) > -1 || item.merchantCode.indexOf(query) > -1;
        },
        merchantCodeList: [],
        allClusterMerchant: []
      }
    },
    async created() {
      this.getList()
      this.getAllBuinessList()
    },
    methods: {
      async lazyLoad (node, resolve) {
        if(node.root){
            let res = await utilsApi.agencyFindAll()
            for(let i of res.data){
                i.value = i.code
                i.leaf = node.level >= 2
                i.label = i.name
            }
            resolve(res.data);
        }else{
            let res = await utilsApi.agencyMerchant({agencyCode: node.data.code})
            let arr = []
            for(let i of res.data){
                i.value = i.merchant
                i.label = i.merchant
                i.leaf = true
                if(arr.length == 0){
                    arr.push(i)
                }else{
                    for(let j of arr){
                        if(j.merchant != i.merchant){
                            arr.push(i)
                        }
                    }
                }
                
            }
            resolve(arr);
        }
      },
      getAllBuinessList() {
        utilsApi.businessFindAll().then((res)=>{
            if(res.code == 0){
                this.allBuinessList = res.data
            }
        })
      },
      async getList() {
        this.listLoading = true
        let data = {
            page: this.listQuery.page,
            size: this.listQuery.size,
        }
        let res = {}
        if(this.type != 'clusterMerchant'){
            res = await utilsApi.clusterPage(Object.assign(data, this.searchObj))
        }else{
            res = await utilsApi.findClusterMerchant(Object.assign(data, this.searchObj1))
        }
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
      async handleCreate1(){
        this.temp1 = {
           
        }
        this.findAllClusterMerchant()
        this.dialogStatus1 = '新增'
        this.dialogFormVisible1 = true
        this.$nextTick(() => {
          this.$refs['dataForm1'].clearValidate()
        })
      },
      createData() {
        let selectData = this.$refs.cascader.getCheckedNodes()[0]
        if(!selectData){
            this.$notify({
                    title: '警告',
                    message: '请先选择通道/商户！',
                    type: 'warning',
                    duration: 2000
                })
            return
        }
        this.$refs['dataForm'].validate(async (valid) => {
          if (valid) {
            let data = JSON.parse(JSON.stringify(this.temp))
            delete data.id
            data.agencyCode = selectData.parent.data.code
            data.agencyMerchant = selectData.data.merchant
            this.buttonLoading = true
            let res = await utilsApi.clusterSave(data)
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
            let data = {
                clusterId: this.currentRow.id,
                list: [this.temp1.merchantCode]
            }
            this.buttonLoading = true
            let res = await utilsApi.insterClusterMerchant(data)
            this.buttonLoading = false
            if(res.code == 0){
                this.$notify({
                    title: '成功',
                    message: '创建成功',
                    type: 'success',
                    duration: 2000
                })
                this.getList()
                this.dialogFormVisible1 = false
            }
          }
        })
      },
      handleUpdate(row) {
        this.temp = row
        this.dialogStatus = '编辑'
        this.dialogFormVisible = true
        this.showCascader = true
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
            let res = await utilsApi.clusterSave(this.temp)
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
            let res = await utilsApi.delCluster({id: row.id})
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
      async handleDelete1(row, index) {
        this.$alert('确定删除该数据？', '删除', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
          callback: async action => {
            if(action != 'confirm'){
                return
            }
            let res = await utilsApi.delClusterMerchant({id: row.id})
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
      handleClusterMerchant(row) {
        this.type = row.id ? 'clusterMerchant' : ''
        this.listQuery.page = 1
        this.searchObj1.clusterId = row?.id
        this.currentRow = row
        this.getList()
      },
      async findAllClusterMerchant() {
        let res = await utilsApi.findAllClusterMerchant({id: this.currentRow.id})
        this.bind = res.data.bind
        this.nowBind = res.data.nowBind
        this.merchantCodeList = this.bind.map(item => item.merchantCode)
        this.allClusterMerchant = this.bind.concat(this.nowBind)
        for(let i of this.allClusterMerchant){
            i.label = i.merchantCode+'-'+i.merchantName
        }
      },
      async handleReset() {
        await this.findAllClusterMerchant()
        this.dialogFormVisible2 = true
      },
      resetClusterMerchant() {
        this.$alert('确定重置该集群的商户？', '重置', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
          callback: async action => {
            if(action != 'confirm'){
                return
            }
            let data = {
                clusterId: this.currentRow.id,
                list: this.merchantCodeList
            }
            this.buttonLoading = true
            let res = await utilsApi.resetClusterMerchant(data)
            this.buttonLoading = false
            if(res.code == 0){
                this.$notify({
                    title: '成功',
                    message: '重置成功',
                    type: 'success',
                    duration: 2000
                })
                this.dialogFormVisible2 = false
                this.getList()
            }
          }
        });
      }
    }
  }
  </script>
  