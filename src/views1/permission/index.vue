<template>
    <div>
        <el-card style="margin-bottom: 10px;">
            <el-form ref="dataForm" inline :rules="rules" :model="temp" label-position="left" label-width="70px">
                <el-form-item :label="'上级菜单'" >
                    <el-input v-model="temp.pname" disabled/>
                </el-form-item>
                <el-form-item :label="'名字'" prop="name">
                    <el-input v-model="temp.name" />
                </el-form-item>
                <el-form-item :label="'类型'" prop="type">
                    <el-select v-model="temp.type" class="filter-item" placeholder="类型">
                      <el-option v-for="item in permissionsType" :key="item.label" :label="item.label" :value="item.value" />
                    </el-select>
                </el-form-item>
                <el-form-item :label="'菜单路由'" v-if="temp.type == 'menu'" label-width="100px" >
                    <el-input v-model="temp.router" />
                </el-form-item>
                <el-form-item :label="'权限编码'" v-if="['menu','function'].includes(temp.type)" label-width="100px" >
                    <el-input v-model="temp.markCode" />
                </el-form-item>
                <el-form-item :label="'是否有效'" label-width="100px" prop="status">
                    <el-select v-model="temp.status" class="filter-item" placeholder="类型">
                      <el-option v-for="item in permissionsStatus" :key="item.label" :label="item.label" :value="item.value" />
                    </el-select>
                  </el-form-item>
            </el-form>
            <el-button type="primary" round size='medium' :disabled="isView" style="margin-left: calc(50% - 60px);width:120px" @click="save">保存</el-button>
        </el-card>
        <el-card>
            <el-button type="primary" round   style="margin-left: calc(50% - 60px);width:120px" @click="addRoot">新增顶级目录</el-button>
            <el-tree :data="permissionsData" :props="defaultProps" node-key="id" :default-expanded-keys="[temp.pid ? temp.pid : 1]" :expand-on-click-node="false"	 @node-click="handleNodeClick">
                <div class="permissionsScope" style="width:100%;" slot-scope="{ node, data }">
                    <el-tag
                        :key="data.id"
                        :type="styleType(data.type)"
                        effect="dark">
                        {{ getLabelType(data.type, 'permissionsType') }}
                    </el-tag>
                    <span style="line-height: 26px;font-size: 12px;margin-left: 12px;">{{ data.name }}</span>
                    <div class="permissionsButton" style="float:right;">
                        <el-button
                            type="primary"
                            size="mini"
                            @click.stop="() => add(node, data)">
                                新增下级
                        </el-button>
                        <el-button
                            type="warning"
                            size="mini"
                            @click.stop="() => update(node, data)">
                                修改
                        </el-button>
                        <el-button
                            type="danger"
                            size="mini"
                            @click.stop="() => del(node, data)">
                                删除
                        </el-button>
                    </div>
                    
                </div>
            </el-tree>
        </el-card>
    </div>
</template>

<script>
    import utilsApi from '@/utils/utilsApi'
    import { recursionPermissions } from '@/utils'
    import { permissionsType, permissionsStatus } from '@/utils/selectList'


    export default {
        name: 'PermissionManager',
        data() {
            return {
                isView: true,
                permissionsData: [],
                defaultProps: {
                    children: 'children',
                    label: 'name'
                },
                temp: {
                    id: undefined,
                    pname: undefined,
                    name: undefined,
                    router: undefined,
                    type: undefined,
                    markCode: undefined,
                    status: 'Y',
                    pid: undefined
                },
                rules: {
                    name: [{ required: true, message: '请输入名字', trigger: 'blur' }],
                    type: [{ required: true, message: '请选择类型', trigger: 'change' }],
                    // router: [{ required: true, message: '请输入路由', trigger: 'blur' }],
                    // markCode: [{ required: true, message: '请输入权限编码', trigger: 'blur' }],
                    status: [{ required: true, message: '请选择状态', trigger: 'change' }],
                },
                permissionsType, permissionsStatus
            }
        },
        created() {
            this.getAllPermission()
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
            handleNodeClick(data, node) {
                this.isView = true
                this.temp = JSON.parse(JSON.stringify(data))
                this.temp.pname = node.parent.data.name
            },
            addRoot() {
                this.isView = false
                this.temp = {
                    id: undefined,
                    name: undefined,
                    router: undefined,
                    type: null,
                    markCode: undefined,
                    status: 'Y',
                }
            },
            add(node, data) {
                this.isView = false
                this.temp = {
                    id: undefined,
                    name: undefined,
                    router: undefined,
                    type: null,
                    markCode: undefined,
                    status: 'Y',
                    pname: data.name,
                    pid: data.id
                }
            },
            update(node, data) {
                this.isView = false
                this.temp = JSON.parse(JSON.stringify(data))
                this.temp.pname = node.parent.data.name
            },
            async save() {
                this.$refs['dataForm'].validate(async(valid) => {
                    if (valid) {
                        let res = await utilsApi.updatePermission(this.temp)
                        this.isView = true
                        if(res.code == 0){
                            if(this.temp.id){
                                this.$notify({
                                    title: '成功',
                                    message: '修改成功',
                                    type: 'success',
                                    duration: 2000
                                })
                            }else{
                                this.$notify({
                                    title: '成功',
                                    message: '新增成功',
                                    type: 'success',
                                    duration: 2000
                                })
                            }
                            this.getAllPermission()
                        }
                    }
                })
            },
            del(node, data) {
                this.$alert('确定删除该权限？', '删除', {
                    confirmButtonText: '确定',
                    callback: async action => {
                        if(action != 'confirm'){
                            return
                        }
                        let res = await utilsApi.delPermission(data.id)
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
                            this.temp.pid = data.pid
                            this.getAllPermission()
                        }
                    }
                    });
            }
        }
    }

</script>