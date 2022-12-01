<!--
 * @Author: hanjiangyanhuo hjpyh@foxmail.com
 * @Date: 2022-10-27 16:11:24
 * @LastEditors: hanjiangyanhuo hjpyh@foxmail.com
 * @LastEditTime: 2022-12-01 20:08:09
 * @FilePath: /vue-element-admin/src/components/seacrh.vue
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
-->
<template>
  <div>
    <el-table
      :data="list"
      border
      fit
      v-loading="loading"
      style="width: 661px;margin-left: 56px;">
      <el-table-column
        prop="currency"
        label="币种"
        width="120">
      </el-table-column>
      <el-table-column
        prop="balance"
        label="余额"
        width="120">
      </el-table-column>
      <el-table-column
        prop="freeze"
        width="120"
        label="冻结余额">
      </el-table-column>
      <el-table-column
          width="300"
          align="center"
          label="操作">
          <template slot-scope="{row}">
            <div >
              <el-button type="success" size="mini" @click="accountFreeze(row, 'UNFREEZE')">解冻</el-button>
              <el-button type="danger" size="mini" @click="accountFreeze(row, 'FREEZE')">冻结</el-button>
              <el-button type="success" size="mini" @click="accountFreeze(row, 'IN')">加余额</el-button>
              <el-button type="danger" size="mini" @click="accountFreeze(row, 'OUT')">减余额</el-button>
            </div>
          </template>
      </el-table-column>
    </el-table>
    <el-dialog :title="showTitle(status)" :visible.sync="dialogFormVisible" center>
      <el-form ref="dataForm" :model="temp" :rules="rules" label-position="left" label-width="120px" style="width: 400px; margin-left:36px;">
          <el-form-item :label="showTitle(status)" prop="amount">
              <el-input  v-model="temp.amount" placeholder="金额">
                  <el-button slot="append">{{currentRow.currency}}</el-button>
              </el-input>
          </el-form-item>
          <el-form-item :label="'备注'">
              <el-input  v-model="temp.remark" :maxlength='200' placeholder="备注"/>
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
  import utilsApi from '@/utils/utilsApi'

  export default {
    props: {
        row: {
          type: Object,
          default: function() {
            return {}
          }
        },
        type: {
          type: String,
          default: ''
        }
    },
    data() {
        return {
            list: [],
            loading: false,
            status: '',
            currentRow: {},
            buttonLoading: false,
            dialogFormVisible: false,
            temp: {
              amount: '',
              remark: ''
            },
            rules: {
              amount: [{ required: true, message: '请输入金额', trigger: 'blur' }],
              // remark: [{ required: true, message: '请输入备注', trigger: 'blur' }],
            }
        }
    },
    watch:{
        row:{
        handler () {
            this.getList()
        },
        immediate: true,
        deep: true
      }
    },
    async mounted() {
        // if(this.row.id) {
        //     this.getList()
        // }
    },
    methods: {
      showTitle(type){
        if(type == 'FREEZE'){
          return '冻结余额'
        }else if(type == 'UNFREEZE') {
          return '解冻余额'
        }else if(type == 'IN') {
          return '加余额'
        }else if(type == 'OUT') {
          return '减余额'
        }
      },
      async getList() {
        if(!this.row.id) {
            return
        }
        this.loading = true
        let res = await utilsApi.searchBalances({code: this.row.merchantCode || this.row.code})
        this.loading = false
        this.list = res.data
      },
      accountFreeze(row, status) {
        this.dialogFormVisible = true
        this.temp.amount = undefined
        this.temp.remark = undefined
        this.currentRow = row
        this.status = status
        this.$nextTick(() => {
          this.$refs['dataForm'].clearValidate()
        })
      },
      confirm() {
        this.$refs['dataForm'].validate(async (valid) => {
          if (valid) {
            let data = {
              id: this.currentRow.id,
              amount: this.temp.amount,
              remake: this.temp.remark,
              type: this.status
            }
            this.buttonLoading = true
            let res = {}
            if(this.status == 'FREEZE' || this.status == 'UNFREEZE') {
              res = await utilsApi.accountFreeze(data)
            } else {
              res = await utilsApi.balanceOperate(data)
            }
            this.buttonLoading = false
            if(res.code == 0){
                this.$notify({
                    title: '成功',
                    message: this.showTitle(this.status),
                    type: 'success',
                    duration: 2000
                })
                this.getList()
                this.dialogFormVisible = false
            }
          }
        })
      }
    }
  }
  </script>
  
  <style lang="scss" >
 
  </style>
  