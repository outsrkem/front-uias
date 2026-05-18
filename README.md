# uias

> 身份认证中心控制台界面

### 构建临时包

```
# 推送分支build_版本号-补丁号，如：
git push origin build/0.0.001-rc.4

# 该分支名称的构建包如下：
uias-0.0.001-rc.4.el6.x86_64.rpm
```

### 构建正式包

```
# 打标签并推送标签
v=0.2.3
git tag -a v$v -m "Release version $v" HEAD && git push origin v$v

# 构建包如下
uias-0.2.3-1.el6.x86_64.rpm
```

### 包部署

```
rpm -ivh uias-0.2.3-1.el6.x86_64.rpm
```

### 包升级

```
rpm -Fvh uias-0.2.3-1.el6.x86_64.rpm
```

### 包强制升级（回退）

```
rpm -Uvh --force uias-0.2.3-1.el6.x86_64.rpm
```
