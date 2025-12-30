// 定义滚动导航类，用于实现内容滚动与导航项联动效果
class ScrollNavigation {
    // 构造函数，初始化类的实例
    constructor() {
        // 获取所有内容区块元素
        this.sections = document.querySelectorAll('.content-section');
        // 获取所有导航项元素
        this.navItems = document.querySelectorAll('.nav-item');
        // 获取内容滚动区域元素
        this.contentArea = document.querySelector('.content-area');

        // 存储每个区块的位置信息（id、顶部偏移量、底部偏移量）
        this.sectionPositions = [];

        // 调用初始化方法
        this.init();
    }

    // 初始化方法，设置所有必要的初始状态
    init() {
        // 计算所有内容区块的位置信息
        this.calculatePositions();
        // 绑定所有必要的事件监听器
        this.bindEvents();
        // 设置初始的激活导航项
        this.setActiveNav();
    }

    // 计算每个内容区块在滚动容器中的精确位置
    calculatePositions() {
        // 重置位置信息数组
        this.sectionPositions = [];

        // 遍历所有内容区块
        this.sections.forEach(section => {
            // 获取当前区块相对于视口的位置和尺寸信息
            const rect = section.getBoundingClientRect();
            // 获取内容滚动区域相对于视口的顶部位置
            const contentTop = this.contentArea.getBoundingClientRect().top;
            // 计算当前区块顶部相对于内容滚动区域顶部的偏移量
            // rect.top - contentTop: 计算区块顶部相对于内容区域顶部的距离（视口坐标系）
            // + this.contentArea.scrollTop: 加上内容区域当前的滚动距离，转换为内容区域内部坐标系
            const offset = rect.top - contentTop + this.contentArea.scrollTop;

            // 将当前区块的位置信息添加到数组中
            this.sectionPositions.push({
                id: section.id,           // 区块的唯一标识ID
                top: offset,              // 区块顶部在内容区域中的位置
                bottom: offset + rect.height  // 区块底部在内容区域中的位置
            });
        });
    }

    // 绑定所有必要的事件监听器
    bindEvents() {
        // 监听内容区域的滚动事件
        this.contentArea.addEventListener('scroll', () => {
            // 滚动时调用处理函数
            this.handleScroll();
        });

        // 遍历所有导航项
        this.navItems.forEach(item => {
            // 为每个导航项绑定点击事件
            item.addEventListener('click', (e) => {
                // 点击时调用处理函数
                this.handleNavClick(e);
            });
        });

        // 监听窗口大小变化事件
        window.addEventListener('resize', () => {
            // 窗口大小变化时重新计算区块位置
            this.calculatePositions();
        });
    }

    // 处理内容区域的滚动事件
    handleScroll() {
        // 获取内容区域当前的滚动距离
        const scrollTop = this.contentArea.scrollTop;
        // 获取内容区域的可视高度
        const viewportHeight = this.contentArea.clientHeight;

        // 初始化当前显示区块为null
        let currentSection = null;

        // 遍历所有区块的位置信息
        for (const section of this.sectionPositions) {
            // 判断当前滚动位置是否在某个区块的可见范围内
            // scrollTop >= section.top - 50: 滚动位置超过区块顶部50像素
            // scrollTop < section.bottom - viewportHeight / 2: 滚动位置未超过区块底部到可视区域中间
            if (scrollTop >= section.top - 50 && scrollTop < section.bottom - viewportHeight / 2) {
                // 设置当前显示区块为找到的区块ID
                currentSection = section.id;
                // 跳出循环，不再继续查找
                break;
            }
        }

        // 如果没有找到当前显示区块，且存在区块位置信息
        if (!currentSection && this.sectionPositions.length > 0) {
            // 获取最后一个区块的位置信息
            const lastSection = this.sectionPositions[this.sectionPositions.length - 1];
            // 如果滚动位置超过最后一个区块的顶部
            if (scrollTop >= lastSection.top) {
                // 设置当前显示区块为最后一个区块ID
                currentSection = lastSection.id;
            }
        }

        // 如果找到当前显示区块
        if (currentSection) {
            // 更新导航项的激活状态
            this.updateActiveNav(currentSection);
        }
    }

    // 处理导航项的点击事件
    handleNavClick(e) {
        // 阻止默认的跳转行为
        e.preventDefault();
        // 获取点击的导航项对应的分类ID（从data-category属性获取）
        const category = e.currentTarget.dataset.category;
        // 根据分类ID获取对应的内容区块元素
        const targetSection = document.getElementById(category);

        // 如果找到对应的内容区块
        if (targetSection) {
            // 计算平滑滚动到目标区块的位置
            // 获取内容区域相对于视口的顶部位置
            const contentAreaTop = this.contentArea.getBoundingClientRect().top;
            // 获取目标区块相对于视口的顶部位置
            const targetTop = targetSection.getBoundingClientRect().top;
            // 计算目标区块在内容区域中的滚动位置
            // this.contentArea.scrollTop: 当前内容区域的滚动距离
            // targetTop - contentAreaTop: 目标区块相对于内容区域顶部的距离
            const scrollTop = this.contentArea.scrollTop + targetTop - contentAreaTop;

            // 执行平滑滚动到目标位置
            this.contentArea.scrollTo({
                top: scrollTop,      // 滚动到计算出的目标位置
                behavior: 'smooth'   // 使用平滑滚动效果
            });

            // 更新导航项的激活状态
            this.updateActiveNav(category);
        }
    }

    // 更新导航项的激活状态
    updateActiveNav(category) {
        // 遍历所有导航项
        this.navItems.forEach(item => {
            // 如果当前导航项的分类ID与传入的分类ID匹配
            if (item.dataset.category === category) {
                // 为当前导航项添加激活类
                item.classList.add('active');

                // 确保激活的导航项在侧边栏的可视范围内
                // 获取当前导航项相对于视口的位置和尺寸
                const navRect = item.getBoundingClientRect();
                // 获取侧边栏元素
                const sidebar = document.querySelector('.sidebar');
                // 获取侧边栏相对于视口的位置和尺寸
                const sidebarRect = sidebar.getBoundingClientRect();

                // 如果导航项的底部超出侧边栏底部，或顶部超出侧边栏顶部
                if (navRect.bottom > sidebarRect.bottom || navRect.top < sidebarRect.top) {
                    // 平滑滚动侧边栏，使当前导航项进入可视范围
                    item.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                }
            } else {
                // 如果当前导航项的分类ID与传入的分类ID不匹配，移除激活类
                item.classList.remove('active');
            }
        });
    }

    // 初始化时设置激活的导航项
    setActiveNav() {
        // 如果存在区块位置信息
        if (this.sectionPositions.length > 0) {
            // 设置第一个区块对应的导航项为激活状态
            this.updateActiveNav(this.sectionPositions[0].id);
        }
    }
}

// 页面加载完成后执行初始化
document.addEventListener('DOMContentLoaded', () => {
    // 创建ScrollNavigation类的实例，启动滚动导航功能
    new ScrollNavigation();
});

// 如果内容是通过AJAX异步加载的，需要在加载完成后使用以下代码：
// 创建ScrollNavigation实例
// const scrollNav = new ScrollNavigation();
// 加载数据后重新计算区块位置
// scrollNav.calculatePositions();