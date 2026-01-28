const activityData = [
    {
        date: '25 Jan 2026',
        amount: '1,500',
        description: 'Netflix & Spotify Subscriptions',
        method: 'MasterCard',
        tag: 'Expense'
    },
    {
        date: '24 Jan 2026',
        amount: '45,000',
        description: 'Monthly Salary Credit',
        method: 'Bank Transfer',
        tag: 'Income'
    },
    {
        date: '22 Jan 2026',
        amount: '850',
        description: 'Starbucks Coffee',
        method: 'UPI',
        tag: 'Expense'
    },
    {
        date: '20 Jan 2026',
        amount: '5,000',
        description: 'Stock Market Investment',
        method: 'Bank Transfer',
        tag: 'Investment'
    },
    {
        date: '18 Jan 2026',
        amount: '2,200',
        description: 'Zomato Dinner Order',
        method: 'UPI',
        tag: 'Expense'
    },
    {
        date: '15 Jan 2026',
        amount: '12,000',
        description: 'Gold Bond Purchase',
        method: 'Net Banking',
        tag: 'Investment'
    },
    {
        date: '13 Jan 2026',
        amount: '3,200',
        description: 'Weekly Groceries',
        method: 'Cash',
        tag: 'Expense'
    },
    {
        date: '12 Jan 2026',
        amount: '2,850',
        description: 'Dinner with Friends',
        method: 'VISA',
        tag: 'Expense'
    },
    {
        date: '12 Jan 2026',
        amount: '3,500',
        description: 'Freelance Project Payment',
        method: 'UPI',
        tag: 'Income'
    },
    {
        date: '10 Jan 2026',
        amount: '3,000',
        description: 'Fuel for Car',
        method: 'RuPay',
        tag: 'Expense'
    },
    {
        date: '10 Jan 2026',
        amount: '1,280',
        description: 'Electricity Bill',
        method: 'UPI',
        tag: 'Expense'
    },
    {
        date: '08 Jan 2026',
        amount: '2,500',
        description: 'Gym Membership',
        method: 'Credit Card',
        tag: 'Expense'
    },
    {
        date: '07 Jan 2026',
        amount: '4,450',
        description: 'Amazon Order (Electronics)',
        method: 'MasterCard',
        tag: 'Expense'
    },
    {
        date: '07 Jan 2026',
        amount: '20,000',
        description: 'Transfer to Emergency Fund',
        method: 'Bank Transfer',
        tag: 'Investment'
    },
    {
        date: '05 Jan 2026',
        amount: '15,000',
        description: 'Apartment Rent',
        method: 'UPI',
        tag: 'Expense'
    },
    {
        date: '05 Jan 2026',
        amount: '12,500',
        description: 'Monthly SIP - Index Fund',
        method: 'Bank Transfer',
        tag: 'Success'
    }
];

const tagConfig = {
    'Expense': { class: 'expense', label: 'Expense' },
    'Income': { class: 'income', label: 'Income' },
    'Investment': { class: 'investment', label: 'Invested' },
    'Saved': { class: 'savings', label: 'Saved' },
    'Success': { class: 'savings', label: 'Saved' }
};

const ui = {
    tableBody: null,
    modal: null,
    closeModalBtn: null,
    addBtn: null,
    exportBtn: null,
    addTransactionBtn: null,
    amountInput: null,
    descriptionInput: null,
    dateInput: null,
    paymentInput: null,
    tagSelector: null,
    tagOptions: [],
    balanceEl: null,
    spendInfo: null,
    cards: {},
    segments: {},
    errors: {}
};

let currentEditIndex = null;

function exportToCSV() {
    if (activityData.length === 0) {
        alert('No data to export');
        return;
    }

    // Prepare CSV headers
    const headers = ['Date', 'Amount (₹)', 'Description', 'Payment Method', 'Tag'];
    
    // Prepare CSV rows
    const rows = activityData.map(item => [
        item.date,
        item.amount,
        item.description,
        item.method,
        item.tag
    ]);

    // Create CSV content
    let csvContent = headers.map(h => `"${h}"`).join(',') + '\n';
    csvContent += rows.map(row => 
        row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')
    ).join('\n');

    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    const timestamp = new Date().toISOString().slice(0, 10);
    link.setAttribute('href', url);
    link.setAttribute('download', `expense-tracker-${timestamp}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

function sortData() {
    activityData.sort((a, b) => new Date(b.date) - new Date(a.date));
}

function renderTable() {
    if (!ui.tableBody) return;

    ui.tableBody.innerHTML = '';
    activityData.forEach((item, index) => {
        const row = document.createElement('tr');
        const config = tagConfig[item.tag] || tagConfig['Expense'];

        row.innerHTML = `
            <td class="date">${item.date}</td>
            <td class="amount">${item.amount}</td>
            <td class="description">${item.description}</td>
            <td><span class="payment-badge">${item.method}</span></td>
            <td><span class="tag-badge ${config.class}">${config.label}</span></td>
            <td><button class="edit-btn" data-index="${index}"><i data-lucide="edit-3"></i></button></td>
        `;

        ui.tableBody.appendChild(row);
    });

    if (window.lucide) window.lucide.createIcons();
}

function openModal(index = null) {
    if (!ui.modal) return;

    currentEditIndex = index;
    const modalTitle = ui.modal.querySelector('.modal-header h2');

    // Reset Styles/Errors
    [ui.amountInput, ui.descriptionInput, ui.dateInput, ui.paymentInput].forEach(input => {
        if (input) input.parentElement.classList.remove('input-error');
    });
    if (ui.tagSelector) ui.tagSelector.parentElement.classList.remove('input-error');

    Object.values(ui.errors).forEach(el => {
        if (el) { el.classList.remove('visible'); el.innerText = ''; }
    });

    if (index !== null) {
        const item = activityData[index];
        modalTitle.innerText = "Edit Transaction";
        ui.addTransactionBtn.innerText = "Update";

        ui.amountInput.value = item.amount.replace(/,/g, '');
        ui.descriptionInput.value = item.description;

        const d = new Date(item.date);
        if (!isNaN(d)) ui.dateInput.value = d.toISOString().split('T')[0];

        ui.paymentInput.value = item.method;

        ui.tagOptions.forEach(opt => {
            opt.classList.toggle('active', opt.getAttribute('data-value') === item.tag);
        });

    } else {
        modalTitle.innerText = "Add New Transaction";
        ui.addTransactionBtn.innerText = "Add";

        ui.amountInput.value = '';
        ui.descriptionInput.value = '';
        ui.dateInput.value = '';
        ui.paymentInput.selectedIndex = 0;

        ui.tagOptions.forEach(opt => opt.classList.remove('active'));
    }

    ui.modal.classList.add('open');
    if (window.lucide) window.lucide.createIcons();
}

let totalIncome = 245350;

function calculateTotals() {
    const totals = {
        global: { income: 0, expense: 0, investment: 0, savings: 0 },
        monthly: { income: 0, expense: 0, investment: 0, savings: 0 }
    };

    const currentMonth = 0;
    const currentYear = 2026;

    activityData.forEach(item => {
        const amt = parseFloat(item.amount.replace(/,/g, ''));
        const itemDate = new Date(item.date);
        const isThisMonth = itemDate.getMonth() === currentMonth && itemDate.getFullYear() === currentYear;

        const tags = {
            'Income': 'income',
            'Expense': 'expense',
            'Investment': 'investment',
            'Success': 'savings', 'Saved': 'savings', 'Saving': 'savings'
        };
        const category = tags[item.tag];

        if (category) {
            totals.global[category] += amt;
            if (isThisMonth) totals.monthly[category] += amt;
        }
    });

    const totalAvailablePool = totalIncome + totals.global.income;
    const balance = totalAvailablePool - (totals.global.expense + totals.global.investment + totals.global.savings);

    return { balance, totalAvailablePool, monthly: totals.monthly };
}

function updateDashboard() {
    const stats = calculateTotals();

    if (ui.balanceEl) {
        ui.balanceEl.innerHTML = `${stats.balance.toLocaleString('en-IN')} <span class="currency">₹</span>`;
    }

    const pool = stats.totalAvailablePool;
    const updateCard = (type, value) => {
        const c = ui.cards[type];
        if (!c) return;
        if (c.val) c.val.innerHTML = `${value.toLocaleString('en-IN')} <span class="currency">₹</span>`;
        if (c.pill && pool > 0) c.pill.innerText = `${((value / pool) * 100).toFixed(1)}%`;
    };

    updateCard('income', stats.monthly.income);
    updateCard('expense', stats.monthly.expense);
    updateCard('investment', stats.monthly.investment);
    updateCard('savings', stats.monthly.savings);

    const updateSeg = (type, val) => {
        const el = ui.segments[type];
        if (el && pool > 0) el.style.flexBasis = `${(val / pool) * 100}%`;
    };

    updateSeg('expense', stats.monthly.expense);
    updateSeg('investment', stats.monthly.investment);
    updateSeg('savings', stats.monthly.savings);

    if (ui.segments.remaining && pool > 0) {
        const remPct = (stats.balance / pool) * 100;
        ui.segments.remaining.style.flexBasis = `${remPct}%`;
        if (ui.spendInfo) ui.spendInfo.innerText = `${remPct.toFixed(1)}%`;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    // 1. Initialize UI Cache
    ui.tableBody = document.getElementById('activity-table-body');
    ui.modal = document.getElementById('transaction-modal');
    ui.closeModalBtn = document.getElementById('close-modal-btn');
    ui.addBtn = document.getElementById('add-btn');
    ui.exportBtn = document.getElementById('export-btn');
    ui.addTransactionBtn = document.getElementById('add-transaction-btn');
    ui.amountInput = document.getElementById('amount-input');
    ui.descriptionInput = document.getElementById('description-input');
    ui.dateInput = document.getElementById('date-input');
    ui.paymentInput = document.getElementById('payment-input');
    ui.tagSelector = document.querySelector('.tag-selector');
    ui.tagOptions = document.querySelectorAll('.tag-option');
    ui.balanceEl = document.querySelector('.balance-info h3');
    ui.spendInfo = document.querySelector('.spend-info strong');

    // Cache Errors
    ['amount', 'description', 'date', 'payment', 'tag'].forEach(key => {
        ui.errors[key] = document.getElementById(`error-${key}`);
    });

    // Cache Cards and Segments
    ['income', 'expense', 'investment', 'savings'].forEach(type => {
        const label = document.querySelector(`.metrics-grid .card .label.${type}`);
        if (label) {
            const card = label.closest('.card');
            ui.cards[type] = {
                val: card.querySelector('.card-value'),
                pill: card.querySelector('.pill')
            };
        }
        ui.segments[type] = document.querySelector(`.progress-bar .segment.${type}`);
    });
    ui.segments.remaining = document.querySelector(`.progress-bar .segment.remaining`);

    updateDashboard();
    renderTable();

    if (window.lucide) window.lucide.createIcons();

    // 2. Listeners
    if (ui.addBtn) ui.addBtn.addEventListener('click', () => openModal(null));
    if (ui.exportBtn) ui.exportBtn.addEventListener('click', exportToCSV);

    if (ui.tableBody) {
        ui.tableBody.addEventListener('click', (e) => {
            const btn = e.target.closest('.edit-btn');
            if (btn) openModal(parseInt(btn.getAttribute('data-index')));
        });
    }

    if (ui.closeModalBtn) ui.closeModalBtn.addEventListener('click', () => ui.modal.classList.remove('open'));

    if (ui.modal) {
        ui.modal.addEventListener('click', (e) => {
            if (e.target === ui.modal) ui.modal.classList.remove('open');
        });
    }

    const calendarIcon = document.querySelector('.calendar-icon');
    if (ui.dateInput && calendarIcon) {
        calendarIcon.addEventListener('click', () => {
            if (typeof ui.dateInput.showPicker === 'function') ui.dateInput.showPicker();
            else ui.dateInput.focus();
        });
    }

    ui.tagOptions.forEach(option => {
        option.addEventListener('click', () => {
            ui.tagOptions.forEach(opt => opt.classList.remove('active'));
            option.classList.add('active');
        });
    });

    if (ui.addTransactionBtn) {
        ui.addTransactionBtn.addEventListener('click', () => {
            const activeTag = document.querySelector('.tag-option.active');

            // Centralized Validation
            const fields = [
                { id: 'amount', el: ui.amountInput, msg: "Please enter a valid amount", val: () => !ui.amountInput.value || isNaN(ui.amountInput.value.replace(/,/g, '')) },
                { id: 'description', el: ui.descriptionInput, msg: "Description is required", val: () => !ui.descriptionInput.value.trim() },
                { id: 'date', el: ui.dateInput, msg: "Please select a date", val: () => !ui.dateInput.value },
                { id: 'payment', el: ui.paymentInput, msg: "Please select a payment method", val: () => !ui.paymentInput.value }
            ];

            let isValid = true;
            fields.forEach(f => {
                const isError = f.val();
                f.el.parentElement.classList.toggle('input-error', isError);
                if (isError) {
                    ui.errors[f.id].innerText = f.msg;
                    ui.errors[f.id].classList.add('visible');
                    isValid = false;
                }
            });

            if (!activeTag) {
                ui.errors.tag.innerText = "Please select a tag";
                ui.errors.tag.classList.add('visible');
                isValid = false;
            }

            if (!isValid) return;

            const dateObj = new Date(ui.dateInput.value);
            const dateStr = dateObj.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

            const transactionObj = {
                date: dateStr,
                amount: parseFloat(ui.amountInput.value.replace(/,/g, '')).toLocaleString('en-IN'),
                description: ui.descriptionInput.value,
                method: ui.paymentInput.value,
                tag: activeTag.getAttribute('data-value')
            };

            if (currentEditIndex !== null) activityData[currentEditIndex] = transactionObj;
            else activityData.unshift(transactionObj);

            sortData(); // Optimization: Sort once after data change
            renderTable();
            updateDashboard();
            ui.modal.classList.remove('open');
        });
    }
});
