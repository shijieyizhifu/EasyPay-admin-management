<template>
  <div class="app-container">
    <el-button type="primary" @click="handleAddRole">
      {{ $t('permission.addRole') }}
    </el-button>

    <el-table :data="rolesList" style="margin-top:30px;" border>
      <el-table-column align="center" label="角色名" width="120">
        <template slot-scope="scope">
          {{ scope.row.name }}
        </template>
      </el-table-column>
      <el-table-column align="center" label="描述" width="180">
        <template slot-scope="scope">
          {{ scope.row.remake }}
        </template>
      </el-table-column>
      <el-table-column align="header-center" label="创建时间" width="160">
        <template slot-scope="scope">
          {{ scope.row.createdTime }}
        </template>
      </el-table-column>
      <el-table-column align="header-center" label="更新时间" width="160">
        <template slot-scope="scope">
          {{ scope.row.updatedTime }}
        </template>
      </el-table-column>
      <el-table-column align="center" :label="'操作'" width="180">
        <template slot-scope="scope">
          <el-button type="primary" size="small" @click="handleEdit(scope)">
            {{ $t('permission.editPermission') }}
          </el-button>
          <el-button type="danger" size="small" @click="handleDelete(scope)">
            {{ $t('permission.delete') }}
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination style="margin-top:0" v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.size" @pagination="getRoles" />

    <el-dialog :close-on-click-modal='false'  :close-on-press-escape='false' :visible.sync="dialogVisible" :title="dialogType==='edit'?'修改角色':'新增角色'">
      <el-form :model="role" label-width="80px" label-position="left">
        <el-form-item label="角色名字">
          <el-input v-model="role.name" placeholder="角色名字" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input
            v-model="role.remake"
            :autosize="{ minRows: 2, maxRows: 4}"
            type="textarea"
            placeholder="角色描述"
          />
        </el-form-item>
        <el-form-item label="权限">
          <el-tree ref="tree" :check-strictly="checkStrictly" :data="permissionsData" :props="defaultProps" show-checkbox node-key="id" class="permission-tree" >
            <div class="permissionsScope" style="width:100%;" slot-scope="{ data }">
              <el-tag
                  :key="data.id"
                  :type="styleType(data.type)"
                  effect="dark">
                  {{ getLabelType(data.type, 'permissionsType') }}
              </el-tag>
              <span style="line-height: 26px;font-size: 12px;margin-left: 4px;">{{ data.name }}</span>
          </div>
          </el-tree>
        </el-form-item>
      </el-form>
      <div style="text-align:right;">
        <el-button type="danger" @click="dialogVisible=false">
          {{ $t('permission.cancel') }}
        </el-button>
        <el-button type="primary" @click="confirmRole">
          {{ $t('permission.confirm') }}
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import path from 'path'
import { deepClone } from '@/utils'
import utilsApi from '@/utils/utilsApi'
import { recursionPermissions } from '@/utils'
import Pagination from '@/components/Pagination' // secondary package based on el-pagination
import { permissionsType } from '@/utils/selectList'


const defaultRole = {
  key: '',
  name: '',
  remake: '',
  routes: []
}

export default {
  name: "Roles",
  components: { Pagination },
  data() {
    return {
      role: Object.assign({}, defaultRole),
      routes: [],
      rolesList: [],
      dialogVisible: false,
      dialogType: 'new',
      checkStrictly: false,
      defaultProps: {
        children: 'children',
        label: 'title'
      },
      listQuery: {
        page: 1,
        size: 10
      },
      total: 0,
      permissionsData: [],
      permissionsType
    }
  },
  created() {
    this.getAllPermission()
    this.getRoles()
  },
  methods: {
    styleType(type){
        if(type == 'table'){
            return ''
        }else if(type == 'menu'){
            return 'success'
        }else if(type == 'function'){
            return 'warning'
        }
        return ''
    },
    getLabelType(value, type) {
        for(let i of this[type]) {
            if(i.value == value) {
                return i.label
            }
        }
        return ''
    },
    async getAllPermission() {
        let res = await utilsApi.getAllPermission()
        this.permissionsData = recursionPermissions(res.data)
    },
    async getRoles() {
      const res = await utilsApi.getRoles(this.listQuery)
      this.rolesList = res.data.records
      this.total = res.data.total
    },
    async getRolePermission(id) {
      const res = await utilsApi.getRolePermission({roleId: id})
      return res.data
    },
    // Reshape the routes structure so that it looks the same as the sidebar
    handleAddRole() {
      this.role = Object.assign({}, defaultRole)
      if (this.$refs.tree) {
        this.$refs.tree.setCheckedNodes([])
      }
      this.dialogType = 'new'
      this.dialogVisible = true
    },
    async handleEdit(scope) {
      const res = await this.getRolePermission(scope.row.id)
      let ids = []
      for(let i of res){
        ids.push(i.id)
      }
      this.dialogType = 'edit'
      this.dialogVisible = true
      this.checkStrictly = true
      this.role = deepClone(scope.row)
      this.$nextTick(() => {
        this.$refs.tree.setCheckedKeys(ids)
        // set checked state of a node not affects its father and child nodes
        this.checkStrictly = false
      })
    },
    handleDelete({ $index, row }) {
      this.$alert('确定删除该角色？', '删除', {
        confirmButtonText: '确定',
        callback: async action => {
            if(action != 'confirm'){
                return
            }
            let res = await utilsApi.delRole({id: row.id})
            if(res.code == 0){
                this.$notify({
                    title: '成功',
                    message: '删除成功',
                    type: 'success',
                    duration: 2000
                })
                this.temp = {
                    id: undefined,
                    name: undefined,
                    router: undefined,
                    type: null,
                    markCode: undefined,
                    status: 'Y',
                }
                this.getRoles()
            }
          }
        });
    },
    async confirmRole() {
      const isEdit = this.dialogType === 'edit'
      this.role.routes = this.$refs.tree.getCheckedKeys().concat(this.$refs.tree.getHalfCheckedKeys())
      let data = {}
      data.id = isEdit ? this.role.id : undefined
      data.remake = this.role.remake
      data.name = this.role.name
      data.permissions = this.role.routes
      let res = await utilsApi.updateRole(data)
      this.dialogVisible = false
      if(res.code == 0) {
        this.getRoles()
        if (isEdit) {
          this.$notify({
              title: '成功',
              message: '修改成功',
              type: 'success',
              duration: 2000
          })
        } else {
          this.$notify({
              title: '成功',
              message: '新增成功',
              type: 'success',
              duration: 2000
          })
        }
      }
    },
    // reference: src/view/layout/components/Sidebar/SidebarItem.vue
    onlyOneShowingChild(children = [], parent) {
      let onlyOneChild = null
      const showingChildren = children.filter(item => !item.hidden)

      // When there is only one child route, the child route is displayed by default
      if (showingChildren.length === 1) {
        onlyOneChild = showingChildren[0]
        onlyOneChild.path = path.resolve(parent.path, onlyOneChild.path)
        return onlyOneChild
      }

      // Show parent if there are no child route to display
      if (showingChildren.length === 0) {
        onlyOneChild = { ... parent, path: '', noShowingChildren: true }
        return onlyOneChild
      }

      return false
    }
  }
}
</script>

<style lang="scss" scoped>
.app-container {
  .roles-table {
    margin-top: 30px;
  }
  .permission-tree {
    margin-bottom: 30px;
  }
}
</style>
