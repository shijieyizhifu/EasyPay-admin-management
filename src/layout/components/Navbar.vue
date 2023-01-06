<template>
  <div class="navbar">
    <hamburger id="hamburger-container" :is-active="sidebar.opened" class="hamburger-container" @toggleClick="toggleSideBar" />

    <breadcrumb id="breadcrumb-container" class="breadcrumb-container" />

    <div class="right-menu">
      <template v-if="device!=='mobile'">
        <!-- <search id="header-search" class="right-menu-item" /> -->

        <error-log class="errLog-container right-menu-item hover-effect" />

        <screenfull id="screenfull" class="right-menu-item hover-effect" />
      </template>

      <el-dropdown class="avatar-container right-menu-item hover-effect" trigger="click">
        <div class="avatar-wrapper">
          <i class="el-icon-user-solid" style="font-size: 25px;"/>
          {{ user.nickName }}
          <i class="el-icon-caret-bottom" />
        </div>
        <el-dropdown-menu slot="dropdown">
          <el-dropdown-item @click.native="updateDialg">
            <span style="display:block;">修改密码</span>
          </el-dropdown-item>
          <el-dropdown-item @click.native="bindGoogle" v-if="!user.is_auth">
            <span style="display:block;">绑定谷歌验证器</span>
          </el-dropdown-item>
          <el-dropdown-item @click.native="unBindGoogle" v-else>
            <span style="display:block;">解绑谷歌验证器</span>
          </el-dropdown-item>
          <el-dropdown-item @click.native="logout">
            <span style="display:block;">{{ $t('navbar.logOut') }}</span>
          </el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
    </div>
    <el-dialog title="修改密码" :visible.sync="dialogFormVisible">
      <el-form ref="dataForm" :rules="rules" :model="temp" label-position="left" label-width="70px" style="width: 400px; margin-left:50px;">
          <el-form-item :label="'旧密码'" prop="oldPassword">
              <el-input v-model="temp.oldPassword" />
          </el-form-item>
          <el-form-item :label="'新密码'" prop="newPassword">
              <el-input v-model="temp.newPassword" />
          </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">
          {{ $t('table.cancel') }}
        </el-button>
        <el-button type="primary" :loading="buttonLoading" @click="updatePassword">
          {{ $t('table.confirm') }}
        </el-button>
      </div>
    </el-dialog>
    <el-dialog title="绑定谷歌验证器" :visible.sync="dialogFormGoogle">
      <el-form ref="dataForm" :rules="rules" :model="temp" label-position="left" label-width="20px" style="width: 400px; margin-left:50px;">
          <div style="text-align: center;">
            <span>打开 Google Authenticator,扫描下方二维码或手动输入下方密钥,添加验证令牌。</span>
            <div style="margin-top: 10px;margin-bottom: 10px;">
              <div class="qrcode" ref="qrCodeUrl"></div>
            </div>
            <div >{{temp1.secret}}</div>
            <el-button style="margin-top: 10px;margin-bottom: 10px;" v-clipboard:copy="temp1.secret" v-clipboard:success="clipboardSuccess" type="primary" icon="el-icon-document">
              复制密钥
            </el-button>
            <div style="margin-bottom: 10px;">输入来自 Google Validator 的 6 位验证码</div>
          </div>
          <el-form-item :label="''" >
            <el-input v-model="temp1.code" />
          </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormGoogle = false;">
          {{ $t('table.cancel') }}
        </el-button>
        <el-button type="primary" :loading="buttonLoading" @click="bindGooleAuth">
          {{ $t('table.confirm') }}
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import Breadcrumb from '@/components/Breadcrumb'
import Hamburger from '@/components/Hamburger'
import ErrorLog from '@/components/ErrorLog'
import Screenfull from '@/components/Screenfull'
import SizeSelect from '@/components/SizeSelect'
import LangSelect from '@/components/LangSelect'
import Search from '@/components/HeaderSearch'
import utilsApi from '@/utils/utilsApi'
import clipboard from '@/directive/clipboard/index.js' // use clipboard by v-directive
import QRCode from 'qrcodejs2'

export default {
  components: {
    Breadcrumb,
    Hamburger,
    ErrorLog,
    Screenfull,
    SizeSelect,
    LangSelect,
    Search
  },
  directives: {
        clipboard
    },
  data() {
    return {
      dialogFormVisible: false,
      temp: {
        oldPassword: '',
        newPassword: ''
      },
      rules: {
        oldPassword: [{ required: true, message: '请输入旧密码', trigger: 'blur' }],
        newPassword: [{ required: true, message: '请输入新密码', trigger: 'blur' }],
      },
      dialogFormGoogle: false,
      temp1: {
        url: ''
      },
      buttonLoading: false
    }
  },
  computed: {
    ...mapGetters([
      'sidebar',
      'avatar',
      'device'
    ]),
    user() {
      return JSON.parse(sessionStorage.getItem('user'))
    }
  },
  methods: {
    creatQrCode() {
        let qrcode = new QRCode(this.$refs.qrCodeUrl, {
            text: this.temp1.url, // 待生成为二维码的内容
            width: 200,
            height: 200,
            colorDark: '#000000',
            colorLight: '#ffffff',
            correctLevel: QRCode.CorrectLevel.H
        })
    },
    clipboardSuccess() {
            this.$message({
                message: '复制成功',
                type: 'success',
                duration: 1500
            })
        },
    toggleSideBar() {
      this.$store.dispatch('app/toggleSideBar')
    },
    async logout() {
      let res = await utilsApi.logout()
      if(res.code == 0){
          this.$notify({
              title: '成功',
              message: '退出成功',
              type: 'success',
              duration: 2000
          })
          this.$router.push('/login')
          sessionStorage.clear()
      }
    },
    updateDialg() {
      this.dialogFormVisible = true
      this.temp = {
        oldPassword: '',
        newPassword: ''
      }
        this.$nextTick(() => {
          this.$refs['dataForm'].clearValidate()
        })
    },
    async bindGoogle() {
      this.dialogFormGoogle = true
      let res = await utilsApi.genSecret()
      this.temp1 = res.data
      
      this.$nextTick(() => {
        this.$refs.qrCodeUrl.innerHTML = '';
        this.creatQrCode()
      })
      // this.temp1.url = await utilsApi.axiosIns.get(res.data.url)
    },
    async bindGooleAuth() {
      if(!this.temp1.code){
        this.$notify({
                title: '警告',
                message: '请输入谷歌验证码！',
                type: 'warning',
                duration: 2000
            })
        return
      }
      this.buttonLoading = true
      let res = await utilsApi.bindGooleAuth({code:this.temp1.code, secret: this.temp1.secret})
      this.buttonLoading = false
      if(res.code == 0){
        this.$notify({
            title: '成功',
            message: '绑定成功',
            type: 'success',
            duration: 2000
        })
        this.dialogFormGoogle = false
      }
    },
    async updatePassword() {
      this.$refs['dataForm'].validate(async(valid) => {
          if (valid) {
            this.buttonLoading = true
            let res = await utilsApi.updatePassword(this.temp)
            this.buttonLoading = false
            if(res.code == 0){
                this.$notify({
                    title: '成功',
                    message: '修改成功',
                    type: 'success',
                    duration: 2000
                })
                this.dialogFormVisible = false
            }
          }
        })
    },
    unBindGoogle() {
            this.$prompt('请输入谷歌验证码', '解绑谷歌验证器', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                inputPattern: /^\d{6}$/,
                inputErrorMessage: '请输入谷歌验证码'
                }).then(async ({ value }) => {
                    let res = await utilsApi.clearAuth({code: value})
                        if(res.code == 0){
                            // this.getUserInfo()
                            this.$notify({
                                title: '成功',
                                message: '解绑谷歌验证器成功',
                                type: 'success',
                                duration: 2000
                            })
                        }
            })
        }
  }
}
</script>

<style lang="scss" scoped>
.navbar {
  height: 50px;
  overflow: hidden;
  position: relative;
  background: #fff;
  box-shadow: 0 1px 4px rgba(0,21,41,.08);

  .hamburger-container {
    line-height: 46px;
    height: 100%;
    float: left;
    cursor: pointer;
    transition: background .3s;
    -webkit-tap-highlight-color:transparent;

    &:hover {
      background: rgba(0, 0, 0, .025)
    }
  }

  .breadcrumb-container {
    float: left;
  }

  .errLog-container {
    display: inline-block;
    vertical-align: top;
  }

  .right-menu {
    float: right;
    height: 100%;
    line-height: 50px;

    &:focus {
      outline: none;
    }

    .right-menu-item {
      display: inline-block;
      padding: 0 8px;
      height: 100%;
      font-size: 18px;
      color: #5a5e66;
      vertical-align: text-bottom;

      &.hover-effect {
        cursor: pointer;
        transition: background .3s;

        &:hover {
          background: rgba(0, 0, 0, .025)
        }
      }
    }

    .avatar-container {
      margin-right: 30px;

      .avatar-wrapper {
        margin-top: 5px;
        position: relative;

        .user-avatar {
          cursor: pointer;
          width: 40px;
          height: 40px;
          border-radius: 10px;
        }

        .el-icon-caret-bottom {
          cursor: pointer;
          position: absolute;
          right: -20px;
          top: 25px;
          font-size: 12px;
        }
      }
    }
  }
}


</style>
