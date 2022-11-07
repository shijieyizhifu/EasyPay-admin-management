<!--
 * @Author: hanjiangyanhuo hjpyh@foxmail.com
 * @Date: 2022-10-27 16:11:24
 * @LastEditors: hanjiangyanhuo hjpyh@foxmail.com
 * @LastEditTime: 2022-11-04 18:03:08
 * @FilePath: /vue-element-admin/src/components/seacrh.vue
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
-->
<template>
    <el-card header="查询条件">
        <el-form :inline="true" label-width="120px">
            <span v-for="(item,index) in searchData" :key="index">
                <el-form-item :label="item.label"  >
                    <el-input style="width:183px;" v-model="item.value" v-if="!item.type" :placeholder="item.label"></el-input>
                    <el-select style="width:183px;" clearable filterable v-if="item.type == 'select'" v-model="item.value" :placeholder="item.label">
                      <el-option v-for="(option,index) in item.list" :key="index" :label="option.name" :value="option.value"></el-option>
                    </el-select>
                </el-form-item>
            </span>
          </el-form>
          <el-row style="display:flex;justify-content:center;">
            <el-button style="margin-left: 10px;"  class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">
              {{ $t('table.search') }}
            </el-button>
            <el-button class="filter-item" style="margin-left: 10px;" type="primary" icon="el-icon-edit" @click="addData">
              {{ $t('table.add') }}
            </el-button>
          </el-row>
    </el-card>
  </template>
  
  <script>
  export default {
    props: {
      searchFields: {
        type: Array,
        default: function() {
          return []
        }
      },
    },
    data() {
      return {
        searchData: this.searchFields.filter(item => item.filter == true)
      }
    },
    // watch:{
    //   searchFields:{
    //     handler () {
    //       this.searchData = this.searchFields.filter(item => item.filter == true)
    //     },
    //     immediate: true,
    //     deep: true
    //   }
    // },
    methods: {
      handleFilter() {
        this.$emit('searchData')
      },
      addData() {
        this.$emit('addData')
      }
    }
  }
  </script>
  
  <style lang="scss" >
 
  </style>
  