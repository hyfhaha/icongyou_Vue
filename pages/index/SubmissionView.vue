<template>
  <div class="min-h-screen bg-gray-50 pb-20">
    <!-- Header -->
    <header class="bg-white shadow-sm sticky top-0 z-20">
      <div class="max-w-4xl mx-auto px-4 py-4">
        <div class="flex items-center justify-between">
          <button @click="goBack" class="p-2 hover:bg-gray-100 rounded-lg transition">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 class="text-lg font-bold text-gray-800">提交团队作业</h1>
          <div class="w-10"></div>
        </div>
      </div>
    </header>

    <div class="max-w-4xl mx-auto px-4 py-6 space-y-6">
      <!-- Countdown Timer -->
      <div class="bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl p-6 text-white shadow-xl">
        <div class="text-center">
          <p class="text-sm text-orange-100 mb-2">距离任务完成还剩</p>
          <div class="text-4xl font-bold mb-1">372:30:46:194</div>
          <p class="text-sm text-orange-100">天 : 时 : 分 : 秒</p>
        </div>
      </div>

      <!-- File Upload Section -->
      <div class="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div class="p-6">
          <h3 class="text-lg font-bold text-gray-800 mb-2 flex items-center">
            <svg class="w-5 h-5 mr-2 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M8 4a3 3 0 00-3 3v4a5 5 0 0010 0V7a1 1 0 112 0v4a7 7 0 11-14 0V7a5 5 0 0110 0v4a3 3 0 11-6 0V7a1 1 0 012 0v4a1 1 0 102 0V7a3 3 0 00-3-3z" clip-rule="evenodd" />
            </svg>
            上传文件
          </h3>
          <p class="text-sm text-gray-500 mb-4">
            单文件大小不超过 <span class="font-medium text-red-500">100MB</span> 且支持 
            <span class="font-medium">rar/mp4</span> 的文件
          </p>

          <!-- Upload Area -->
          <div
            @dragover.prevent
            @drop.prevent="handleDrop"
            class="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-blue-400 transition cursor-pointer"
            @click="triggerFileInput"
          >
            <input
              ref="fileInput"
              type="file"
              multiple
              accept=".rar,.mp4"
              @change="handleFileSelect"
              class="hidden"
            />
            <svg class="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <p class="text-gray-600 mb-2">点击上传或拖拽文件到这里</p>
            <p class="text-sm text-gray-400">支持 .rar, .mp4 格式</p>
          </div>

          <!-- Uploaded Files List -->
          <div v-if="uploadedFiles.length > 0" class="mt-4 space-y-2">
            <div
              v-for="(file, index) in uploadedFiles"
              :key="index"
              class="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
            >
              <div class="flex items-center flex-1">
                <div class="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                  <svg class="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clip-rule="evenodd" />
                  </svg>
                </div>
                <div class="flex-1">
                  <p class="font-medium text-gray-800 text-sm">{{ file.name }}</p>
                  <p class="text-xs text-gray-500">{{ formatFileSize(file.size) }}</p>
                </div>
              </div>
              <button
                @click="removeFile(index)"
                class="p-2 text-red-500 hover:bg-red-50 rounded-lg transition"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Team Contribution -->
      <div class="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div class="p-6">
          <h3 class="text-lg font-bold text-gray-800 mb-4 flex items-center">
            <svg class="w-5 h-5 mr-2 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
            </svg>
            团队成员贡献度
          </h3>

          <!-- Radar Chart Placeholder -->
          <div class="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 mb-4">
            <div class="text-center">
              <svg class="w-64 h-64 mx-auto" viewBox="0 0 200 200">
                <!-- Radar background -->
                <polygon
                  points="100,20 172,60 172,140 100,180 28,140 28,60"
                  fill="#e0e7ff"
                  stroke="#6366f1"
                  stroke-width="1"
                  opacity="0.3"
                />
                <polygon
                  points="100,50 150,75 150,125 100,150 50,125 50,75"
                  fill="#c7d2fe"
                  stroke="#6366f1"
                  stroke-width="1"
                  opacity="0.3"
                />
                <!-- Radar data -->
                <polygon
                  points="100,30 160,70 150,130 90,160 40,120 50,65"
                  fill="#6366f1"
                  stroke="#4f46e5"
                  stroke-width="2"
                  opacity="0.5"
                />
                <!-- Labels -->
                <text x="100" y="15" text-anchor="middle" class="text-xs fill-gray-700">本分配</text>
                <text x="180" y="65" text-anchor="start" class="text-xs fill-gray-700">协同配合</text>
                <text x="180" y="145" text-anchor="start" class="text-xs fill-gray-700">个体贡献</text>
                <text x="100" y="195" text-anchor="middle" class="text-xs fill-gray-700">责任承担</text>
                <text x="20" y="145" text-anchor="end" class="text-xs fill-gray-700">冲突化解</text>
                <text x="20" y="65" text-anchor="end" class="text-xs fill-gray-700">任务完成</text>
              </svg>
              <p class="text-sm text-gray-600 mt-2">
                任务: <span class="font-medium text-blue-600">T4-1爱从游（学生移动端）</span>
              </p>
            </div>
          </div>

          <!-- Contribution Sliders -->
          <div class="space-y-4">
            <div
              v-for="member in teamMembers"
              :key="member.id"
              class="space-y-2"
            >
              <div class="flex items-center justify-between">
                <div class="flex items-center">
                  <div class="w-8 h-8 bg-gradient-to-r from-blue-400 to-indigo-400 rounded-full flex items-center justify-center text-white text-xs font-bold mr-2">
                    {{ member.name.charAt(0) }}
                  </div>
                  <span class="font-medium text-gray-800 text-sm">{{ member.name }}</span>
                </div>
                <div class="flex items-center space-x-2">
                  <button
                    @click="decreaseContribution(member.id)"
                    class="w-6 h-6 bg-gray-200 hover:bg-gray-300 rounded flex items-center justify-center transition"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4" />
                    </svg>
                  </button>
                  <span class="w-8 text-center font-bold text-blue-600">{{ member.contribution }}</span>
                  <button
                    @click="increaseContribution(member.id)"
                    class="w-6 h-6 bg-gray-200 hover:bg-gray-300 rounded flex items-center justify-center transition"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                    </svg>
                  </button>
                </div>
              </div>
              <div class="w-full bg-gray-200 rounded-full h-2">
                <div
                  :style="{ width: (member.contribution / totalContribution * 100) + '%' }"
                  class="h-full bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full transition-all duration-300"
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Submit Button -->
      <button
        @click="submitWork"
        :disabled="uploadedFiles.length === 0"
        class="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all disabled:cursor-not-allowed"
      >
        提交团队作业
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const fileInput = ref(null)
const uploadedFiles = ref([])

const teamMembers = ref([
  { id: 1, name: '张三', contribution: 0 },
  { id: 2, name: '李四', contribution: 0 },
  { id: 3, name: '王五', contribution: 0 },
  { id: 4, name: '赵六', contribution: 0 }
])

const totalContribution = computed(() => {
  return teamMembers.value.reduce((sum, member) => sum + member.contribution, 0)
})

const triggerFileInput = () => {
  fileInput.value?.click()
}

const handleFileSelect = (event) => {
  const files = Array.from(event.target.files)
  uploadedFiles.value.push(...files)
}

const handleDrop = (event) => {
  const files = Array.from(event.dataTransfer.files)
  uploadedFiles.value.push(...files)
}

const removeFile = (index) => {
  uploadedFiles.value.splice(index, 1)
}

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
}

const increaseContribution = (memberId) => {
  const member = teamMembers.value.find(m => m.id === memberId)
  if (member) member.contribution++
}

const decreaseContribution = (memberId) => {
  const member = teamMembers.value.find(m => m.id === memberId)
  if (member && member.contribution > 0) member.contribution--
}

const submitWork = () => {
  console.log('Submit work:', {
    files: uploadedFiles.value,
    contributions: teamMembers.value
  })
}

const goBack = () => {
  console.log('Go back')
}
</script>
