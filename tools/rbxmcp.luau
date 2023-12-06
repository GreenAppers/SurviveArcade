-- lune rbxmcp.luau Baseplate.rbxm Baseplate.rbxmx

local fs = require("@lune/fs")
local process = require("@lune/process")
local roblox = require("@lune/roblox")

if #process.args < 2 then
  error("Usage: rbxmcp <source_file> <target_file>")
end

function getFileExtension(url)
  return url:match("^.+(%..+)$")
end

local sourceFile = process.args[1]
local targetFile = process.args[2]
local targetIsXml = getFileExtension(targetFile) == ".rbxmx"
local file = fs.readFile(sourceFile)
local model = roblox.deserializeModel(file)
local targetContent = roblox.serializeModel(model, targetIsXml)
fs.writeFile(targetFile, targetContent)
