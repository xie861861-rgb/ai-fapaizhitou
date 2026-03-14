# AI法拍智投 - 启动脚本
# 同时启动前端和后端服务

echo "🚀 启动 AI 法拍智投..."

# 检查并安装依赖
if [ ! -d "node_modules" ]; then
  echo "📦 安装依赖..."
  npm install
fi

# 启动后端服务
echo "🔧 启动后端服务 (端口 3001)..."
cd server
npm run dev &
SERVER_PID=$!
cd ..

# 等待后端启动
sleep 3

# 启动前端服务
echo "🎨 启动前端服务 (端口 3000)..."
npm run dev &

echo ""
echo "✅ 服务已启动!"
echo "   前端: http://localhost:3000"
echo "   后端: http://localhost:3001"
echo ""
echo "按 Ctrl+C 停止所有服务"
