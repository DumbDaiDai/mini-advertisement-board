<template>
  <div :class="styles.loginContainer">
    <transition appear>
      <el-card :class="styles.loginCard">
        <!-- 卡片标题 -->
        <template #header>
          <el-text size="large" tag="b">
            登录 (账号1，密码2)
          </el-text>
        </template>
        <client-only>
          <el-form
            ref="formRef"
            label-width="auto"
            :model="loginForm"
            :rules="formRules"
            hide-required-asterisk
          >
            <el-form-item prop="username">
              <template #label>
                <el-text :class="styles.loginLabel">
                  用户名
                  <Icon name="mdi:user-circle-outline" :size="18" />
                </el-text>
              </template>
              <!-- 用户名输入框 -->
              <el-input
                v-model="loginForm.username"
                :class="styles.loginFormInput"
                placeholder="请输入用户名"
                @change="handleUsernameChange()"
                @keyup.enter="($refs.passwordInputRef as InputInstance).focus()"
              />
            </el-form-item>
            <el-form-item prop="password">
              <template #label>
                <div>
                  <el-text :class="styles.loginLabel">
                    密码
                    <Icon name="ic:outline-lock" :size="18" />
                  </el-text>
                </div>
              </template>
              <!-- 密码输入框 -->
              <el-input
                ref="passwordInputRef"
                v-model="loginForm.password"
                :class="styles.loginFormInput"
                type="password"
                placeholder="请输入密码"
                show-password
                @change="handlePasswordChange()"
                @keyup.enter="($refs.loginButtonRef as ButtonInstance).ref!.click()"
              />
            </el-form-item>
            <!-- 登录按钮 -->
            <el-button
              ref="loginButtonRef"
              type="primary"
              :class="styles.loginButton"
              @click="handleLoginClick()"
            >
              登录
            </el-button>
          </el-form>
        </client-only>
      </el-card>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { useMutation } from "@tanstack/vue-query";
import type { FormRules } from "element-plus";
import { ElButton, ElCard, ElForm, ElFormItem, ElInput, ElMessage, ElText } from "element-plus";
import type { InputInstance } from "element-plus/es/components/index.mjs";
import type { ButtonInstance } from "element-plus/lib/components/index.js";
import { ref, useTemplateRef } from "vue";

import { navigateTo } from "#imports";
import { postLogin } from "~/service/api";
import { useAuthStore } from "~/stores/auth-store";

import { default as styles } from "./index.module.css";

/** 登录表单DOM */
const formRef = useTemplateRef("formRef");

/** 登录表单数据 */
const loginForm = ref({
  username: "",
  password: ""
});

/** 表单校验规则 */
const formRules: FormRules = {
  username: [
    {
      required: true,
      message: "请填写用户名",
      trigger: "blur"
    }
  ],
  password: [
    {
      required: true,
      message: "请填写密码",
      trigger: "blur"
    }
  ]
};

/** 用户名输入完成 */
const handleUsernameChange = () => {
  loginForm.value.username = loginForm.value.username.trim();
};

/** 密码输入完成 */
const handlePasswordChange = () => {
  loginForm.value.password = loginForm.value.password.trim();
};

/** 点击登录 */
const handleLoginClick = () => {
  loginForm.value.username = loginForm.value.username.trim();
  loginForm.value.password = loginForm.value.password.trim();
  formRef.value?.validate((pass) => {
    pass ? mutateLogin() : ElMessage.error("请正确填写用户名和密码");
  });
};

// 登录
const { mutate: mutateLogin } = useMutation({
  mutationFn: () =>
    postLogin({
      username: loginForm.value.username,
      password: loginForm.value.password
    }),
  onSuccess: () => {
    ElMessage.success({
      message: "登录成功",
      grouping: true
    });
    useAuthStore().loggedIn = true;
    navigateTo(
      useRoute().query.fromPath ? decodeURIComponent(useRoute().query.fromPath as string) : "/"
    );
  },
  onError: (err) => {
    ElMessage.error(err.message || "登录失败");
  }
});

useSeoMeta({ title: "登录" });
</script>
