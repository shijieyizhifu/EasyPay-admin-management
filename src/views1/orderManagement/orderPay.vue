
<template>
<el-card>
    <el-row>
        <el-col :span="12">
            <el-card>
                <el-form ref="dataForm" :model="temp" :rules="rules" label-position="left" label-width="120px" >
                    <el-form-item label="商户号" prop="merchant">
                        <el-select v-model="temp.merchant" @change="findMerchantRate" filterable placeholder="请选择">
                            <el-option
                              v-for="item in merchantList"
                              :key="item.merchantCode"
                              :label="item.name"
                              :value="item.merchantCode">
                            </el-option>
                          </el-select>
                    </el-form-item>
                    <el-form-item label="订单号" prop="orderNo">
                        <el-input  v-model="temp.orderNo" placeholder="订单号">
                            <template slot="append">
                                <el-button type="primary" @click="temp.orderNo = new Date().getTime()">生成</el-button>
                            </template>
                        </el-input>
                    </el-form-item>
                    <el-form-item label="平台业务" prop="businessCode">
                        <el-select v-model="temp.businessCode" filterable placeholder="请选择">
                            <el-option
                              v-for="item in businessList"
                              :key="item.businessCode"
                              :label="item.businessName"
                              :value="item.businessCode">
                            </el-option>
                          </el-select>
                    </el-form-item>
                    <el-form-item label="名字" prop="name">
                        <el-input  v-model="temp.name" placeholder="名字"/>
                    </el-form-item>
                    <el-form-item label="邮箱" prop="email">
                        <el-input  v-model="temp.email" placeholder="邮箱"/>
                    </el-form-item>
                    <el-form-item label="金额" prop="amount">
                        <el-input  v-model="temp.amount" placeholder="金额"/>
                    </el-form-item>
                    <el-form-item label="手机号" prop="phone">
                        <el-input  v-model="temp.phone" placeholder="手机号"/>
                    </el-form-item>
                    <el-form-item label="通知地址" prop="notifyUrl">
                        <el-input  v-model="temp.notifyUrl" placeholder="通知地址"/>
                    </el-form-item>
                    <el-form-item label="回调页面地址" prop="pageUrl">
                        <el-input  v-model="temp.pageUrl" placeholder="回调页面地址"/>
                    </el-form-item>
                    <el-form-item label="银行编码" prop="bankCode">
                        <el-input  v-model="temp.bankCode" placeholder="银行编码"/>
                    </el-form-item>
                    <el-form-item :label="'备注'">
                        <el-input  v-model="temp.subject" :maxlength='200' placeholder="备注"/>
                    </el-form-item>
                    <el-form-item>
                        <el-button :loading="loading" type="primary" @click="orderPay">
                            提交
                          </el-button>
                    </el-form-item>
                </el-form>
            </el-card>
        </el-col>
        <el-col :span="12">
            <el-card style="margin-left: 12px;">
                <el-result icon="success" v-if="msg.indexOf('成功') >= 0">
                </el-result>
                <el-result icon="error" v-if="msg.indexOf('失败') >= 0">
                </el-result>
                <div class="result" style="width:80%" v-html="msg.replaceAll(',',',<br>').replace('\http','http')"></div>
            </el-card>
        </el-col>
    </el-row>
</el-card>
</template>

<script>
import utilsApi from '@/utils/utilsApi'

export default {
    data() {
        return {
            temp: {
                merchant: '100019',
                orderNo: new Date().getTime(), 
                businessCode: '100030',
                name: 'test',
                phone: '15998765432',
                email: '15998765432@163.com',
                amount: 100,
                notifyUrl: 'https://api.qg-pay.com/test',
                pageUrl: 'https://api.qg-pay.com/test',
                bankCode: "BANK",
                subject: '测试测试'
            },
            rules: {
                merchant: [{ required: true, message: '请输入商户号', trigger: 'blur' }],
                orderNo: [{ required: true, message: '请输入订单号', trigger: 'blur' }],
                businessCode: [{ required: true, message: '请选择业务', trigger: 'change' }],
                name: [{ required: true, message: '请输入名字', trigger: 'blur' }],
                phone: [{ required: true, message: '请输入手机号', trigger: 'blur' }],
                email: [{ required: true, message: '请输入邮箱', trigger: 'blur' }],
                amount: [{ required: true, message: '请输入金额', trigger: 'blur' }],
                notifyUrl: [{ required: true, message: '请输入通知地址', trigger: 'blur' }],
                pageUrl: [{ required: true, message: '请输入回调页面地址', trigger: 'blur' }],
                bankCode: [{ required: true, message: '请输入银行编码', trigger: 'blur' }],
            },
            businessList:[],
            msg: '',
            loading: false,
            merchantList: []
        }
    },
    async created() {
        this.merchantPage()
    },
    methods: {
        async merchantPage() {
            let res = await utilsApi.merchantPage({page:1,size:10000})
            this.merchantList = res.data.records
            this.temp.merchant = this.merchantList.find(item => item.name == '平台测试商户号')?.merchantCode
            if(this.temp.merchant)this.findMerchantRate()
        },
        async findMerchantRate() {
            let res = await utilsApi.findMerchantRate({merchantCode: this.temp.merchant})
            this.businessList = res.data.filter(item => item.status == 'Y')
            this.temp.businessCode = this.businessList[0]?.businessCode
        },
        async orderPay() {
            this.$refs['dataForm'].validate(async (valid) => {
                if (valid) {
                    try {
                        let data = JSON.parse(JSON.stringify(this.temp))
                        let rsaPrivate = this.merchantList.find(item => item.merchantCode == this.temp.merchant)?.rsaPrivate
                        data.sign = utilsApi.sign(data,rsaPrivate)
                        this.loading = true
                        let res = await utilsApi.orderPay(data)
                        this.loading = false
                        if(res.code == 0){
                            res.data.orderData = `<a class='el-link el-link--primary' href=${res.data.orderData} target=_blank>${res.data.orderData}</a>`
                            this.msg = '下单成功：,'+(JSON.stringify(res.data)).replaceAll('"','')
                        }else{
                            this.msg = '下单失败：,'+res.message
                        }
                    } catch (error) {
                        this.msg = '下单失败：,'+JSON.stringify(error)
                    }
                }
            })
        },
    }
}
</script>

<style lang="scss" >

</style>
