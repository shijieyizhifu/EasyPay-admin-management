<!--
 * @Author: hanjiangyanhuo hjpyh@foxmail.com
 * @Date: 2022-10-27 16:11:24
 * @LastEditors: hanjiangyanhuo hjpyh@foxmail.com
 * @LastEditTime: 2022-12-28 14:07:19
 * @FilePath: /vue-element-admin/src/components/seacrh.vue
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
-->
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
                    <el-form-item label="账户名" prop="accName">
                        <el-input  v-model="temp.accName" placeholder="账户名"/>
                    </el-form-item>
                    <el-form-item label="账户" prop="accNo">
                        <el-input  v-model="temp.accNo" placeholder="账户"/>
                    </el-form-item>
                    <el-form-item label="金额" prop="orderAmount">
                        <el-input  v-model="temp.orderAmount" placeholder="金额"/>
                    </el-form-item>
                    <el-form-item label="手机号" prop="phone">
                        <el-input  v-model="temp.phone" placeholder="手机号"/>
                    </el-form-item>
                    <el-form-item label="通知地址" prop="notifyUrl">
                        <el-input  v-model="temp.notifyUrl" placeholder="通知地址"/>
                    </el-form-item>
                    <el-form-item label="省份" >
                        <el-input  v-model="temp.province" placeholder="省份"/>
                    </el-form-item>
                    <el-form-item label="银行编码" prop="bankCode">
                        <el-input  v-model="temp.bankCode" placeholder="银行编码"/>
                    </el-form-item>
                    <el-form-item label="证件号" >
                        <el-input  v-model="temp.identityNo" placeholder="证件号"/>
                    </el-form-item>
                    <el-form-item label="证件类型">
                        <el-input  v-model="temp.identityType" placeholder="证件类型"/>
                    </el-form-item>
                    <el-form-item :label="'备注'">
                        <el-input  v-model="temp.remake" :maxlength='200' placeholder="备注"/>
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
                <div v-html="msg.replaceAll(',',',<br>')"></div>
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
                accName: '3333',
                phone: '15998765432',
                accNo: '1111',
                orderAmount: 100,
                notifyUrl: 'http://8.218.2.19:8000/test',
                province: '',
                bankCode: "UPI",
                identityType: '',
                identityNo: '',
                remake: '测试测试'
            },
            rules: {
                merchant: [{ required: true, message: '请输入商户号', trigger: 'blur' }],
                orderNo: [{ required: true, message: '请输入订单号', trigger: 'blur' }],
                businessCode: [{ required: true, message: '请选择业务', trigger: 'change' }],
                accName: [{ required: true, message: '请输入账户名', trigger: 'blur' }],
                phone: [{ required: true, message: '请输入手机号', trigger: 'blur' }],
                accNo: [{ required: true, message: '请输入账户', trigger: 'blur' }],
                orderAmount: [{ required: true, message: '请输入金额', trigger: 'blur' }],
                notifyUrl: [{ required: true, message: '请输入通知地址', trigger: 'blur' }],
                province: [{ required: true, message: '请输入省份', trigger: 'blur' }],
                bankCode: [{ required: true, message: '请输入银行编码', trigger: 'blur' }],
                identityNo: [{ required: true, message: '请输入证件号', trigger: 'blur' }],
                identityType: [{ required: true, message: '请输入身份证类型', trigger: 'blur' }],
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
                        let res = await utilsApi.singleOrder(data)
                        this.loading = false
                        if(res.code == 0){
                            this.msg = '下单成功：,'+JSON.stringify(res.data)
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
