<template>
<div>
    <el-table :data="list" border fit v-loading="loading" :style="{width: type != 'ChannelMerchant' ? '661px' : '371px',marginLeft: '56px'}">
        <el-table-column prop="currency" label="币种" width="120">
        </el-table-column>
        <el-table-column prop="balance" label="余额" width="120">
        </el-table-column>
        <el-table-column prop="freeze" v-if="type != 'ChannelMerchant'" width="120" label="冻结余额">
        </el-table-column>
        <el-table-column prop="freeBalance" v-else width="130" label="冻结/未结算余额">
        </el-table-column>
        <el-table-column width="300" align="center" label="操作" v-if="type != 'ChannelMerchant'">
            <template slot-scope="{row}">
                <div>
                    <el-button type="success" size="mini" @click="accountFreeze(row, 'UNFREEZE')">解冻</el-button>
                    <el-button type="danger" size="mini" @click="accountFreeze(row, 'FREEZE')">冻结</el-button>
                    <el-button type="success" size="mini" @click="accountFreeze(row, 'IN')">加余额</el-button>
                    <el-button type="danger" size="mini" @click="accountFreeze(row, 'OUT')">减余额</el-button>
                </div>
            </template>
        </el-table-column>
    </el-table>
    <el-dialog :close-on-click-modal='false' :close-on-press-escape='false' :title="showTitle(status)" :visible.sync="dialogFormVisible" center>
        <el-form ref="dataForm" :model="temp" :rules="rules" label-position="left" label-width="120px" style="width: 400px; margin-left:36px;">
            <el-form-item :label="showTitle(status)" prop="amount">
                <el-input v-model="temp.amount" placeholder="金额">
                    <el-button slot="append">{{currentRow.currency}}</el-button>
                </el-input>
            </el-form-item>
            <el-form-item :label="'备注'">
                <el-input type="textarea" v-model="temp.remark" :maxlength='200' placeholder="备注" />
            </el-form-item>
            <el-form-item :label="'谷歌验证码'" prop="verifCode">
                <el-input v-model="temp.verifCode" placeholder="谷歌验证码" />
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
            default: function () {
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
                amount: [{
                    required: true,
                    message: '请输入金额',
                    trigger: 'blur'
                }],
                verifCode: [{
                    required: true,
                    message: '请输入谷歌验证码',
                    trigger: 'blur'
                }],
            }
        }
    },
    watch: {
        row: {
            handler() {
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
        showTitle(type) {
            if (type == 'FREEZE') {
                return '冻结余额'
            } else if (type == 'UNFREEZE') {
                return '解冻余额'
            } else if (type == 'IN') {
                return '加余额'
            } else if (type == 'OUT') {
                return '减余额'
            }
        },
        async getList() {
            if (!this.row.id) {
                return
            }
            this.loading = true
            let res
            if(this.type == 'ChannelMerchant'){
                res =  await utilsApi.agencyMerchantFindBalance({
                    id: this.row.id
                })
            }else{
                res = await utilsApi.searchBalances({
                    code: this.row.merchantCode || this.row.code
                })
            }
            this.loading = false
            this.list = res.data
        },
        accountFreeze(row, status) {
            let user = JSON.parse(sessionStorage.getItem('user'))
            if (!user.is_auth) {
                this.$notify({
                    title: '警告',
                    message: '请先去右上角绑定谷歌验证器，再进行该操作！',
                    type: 'warning',
                    duration: 2000
                })
                return
            }
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
                        type: this.status,
                        verifCode: this.temp.verifCode
                    }
                    this.buttonLoading = true
                    let res = {}
                    if (this.status == 'FREEZE' || this.status == 'UNFREEZE') {
                        res = await utilsApi.accountFreeze(data)
                    } else {
                        res = await utilsApi.balanceOperate(data)
                    }
                    this.buttonLoading = false
                    if (res.code == 0) {
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
