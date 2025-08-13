document.addEventListener('DOMContentLoaded', function () {
    // ===== スクロールでふわっと表示される処理 =====
    window.addEventListener('scroll', function () {
        const scroll = window.scrollY;
        const windowHeight = window.innerHeight;
        // .fadein_fast, .fadein, .fadein_slow のクラスが付いた要素を取得
        const elements = document.querySelectorAll('.fadein_fast, .fadein, .fadein_slow');
        elements.forEach(function (el) {
            const targetElement = el.getBoundingClientRect().top + scroll;
            // まだ表示されていない要素で、スクロール位置が要素の表示条件を満たす場合
            if (!el.dataset.shown && scroll > targetElement - windowHeight + 100) {
                el.style.opacity = '1'; // 透明から表示
                el.style.transform = 'translateY(0)';   // Y方向移動を元の位置へ
                el.dataset.shown = 'true';  // 2回目以降は処理しない(初回のみふわっと出現)
            }
        });
    });
    window.dispatchEvent(new Event('scroll'));

    // ===== カート開閉処理 =====
    const cartButton = document.getElementById('cartButton');
    const cartMenu = document.getElementById('cartMenu');
    if (cartButton && cartMenu) {
        const cartIconImage = cartButton.querySelector('img');
        const returnIconImage = document.createElement('img');
        returnIconImage.src = 'img/return.png';
        returnIconImage.alt = 'お買い物に戻る';
        returnIconImage.style.width = '28px';
        returnIconImage.style.height = '28px';

        // ボタンクリックでカート開閉を切り替える
        cartButton.addEventListener('click', function () {
            if (cartMenu.classList.contains('open')) {
                cartMenu.classList.remove('open');
                cartButton.textContent = '';
                cartIconImage.style.display = 'inline';
                cartButton.appendChild(cartIconImage);
            } else {
                cartMenu.classList.add('open');
                cartButton.textContent = '';
                cartButton.appendChild(returnIconImage);
            }
        });
    }

    // ===== 商品情報の初期化・数量制御 =====
    const cartItems = document.querySelectorAll('.cart_item');
    const cartButtons = document.querySelectorAll('button.cart');
    const itemMap = {};          // 商品ごとの状態管理用オブジェクト
    let shouldShowUnits = false; // 「○個」表示のON/OFF制御

    // ===== 表示名 → 処理名 の変換マップ =====
    // "ショートケーキ(ホール)"だと文字数が多く「カートの中身」内で変に改行してしまうので、"ショートケーキ(H)"と表示されるようにした
    const productNameMap = {
        "ショートケーキ(ホール)": "ショートケーキ(H)"
    };

    // 商品ごとに初期設定とボタンのイベント登録
    cartItems.forEach(function (item) {
        const nameElem = item.querySelector('.name');
        const countText = item.querySelector('.count');
        const ko = item.querySelector('.ko');
        const plusBtn = item.querySelector('.plus');
        const minusBtn = item.querySelector('.minus');
        const name = nameElem?.dataset.name || nameElem?.textContent.trim();

        if (!name) return;

        countText.textContent = ''; // 初期状態を非表示に
        countText.style.display = 'none';
        ko.style.display = 'none';
        plusBtn.style.display = 'none';
        minusBtn.style.display = 'none';
        nameElem.style.display = 'none';

        // 状態を itemMap に登録
        itemMap[name] = {
            count: 0,
            countText,
            ko,
            plusBtn,
            minusBtn,
            nameElem
        };

        // プラスボタンの処理
        plusBtn.addEventListener('click', function () {
            itemMap[name].count++;
            updateDisplay(itemMap[name]);
            updateTotalAmount();
        });

        // マイナスボタンの処理
        minusBtn.addEventListener('click', function () {
            if (itemMap[name].count > 0) {
                itemMap[name].count--;
                updateDisplay(itemMap[name]);
                updateTotalAmount();
            }
        });
    });

    // 商品選択時（カートに追加ボタン）の処理
    cartButtons.forEach(function (btn) {
        btn.addEventListener('click', function () {
            const dt = btn.closest('dd').previousElementSibling;
            const productName = dt?.textContent.trim();
            const mappedName = productNameMap[productName] || productName;
            const item = itemMap[mappedName];
            if (!item) return;
            item.count++;
            updateDisplay(item);
            updateTotalAmount();
        });
    });

    // 商品の表示制御
    function updateDisplay(item) {
        item.countText.textContent = item.count;
        if (item.count > 0) {
            item.countText.style.display = 'inline';
            item.ko.style.display = 'inline';
            item.plusBtn.style.display = 'inline';
            item.minusBtn.style.display = 'inline';
            item.nameElem.style.display = 'inline';
            shouldShowUnits = true;
        } else {
            item.countText.style.display = 'none';
            item.ko.style.display = 'none';
            item.plusBtn.style.display = 'none';
            item.minusBtn.style.display = 'none';
            item.nameElem.style.display = 'none';
        }

        // 全体の「個」表示制御
        const unitLabels = document.querySelectorAll('.text_flex .ko');
        unitLabels.forEach(unit => {
            unit.style.display = shouldShowUnits ? 'inline-block' : 'none';
        });
    }

    // ===== 合計金額 & 個数表示処理 =====
    const priceMap = {
        "ミルクレープ": 600,
        "ショートケーキ(H)": 3500,
        "アニバーサリーケーキ": 1200,
        "クッキー": 400,
        "季節のキャンディー": 500,
        "モンブラン": 800
    };

    function updateTotalAmount() {
        let total = 0;
        let totalCount = 0;

        for (const name in itemMap) {
            const item = itemMap[name];
            if (priceMap[name]) {
                total += item.count * priceMap[name];
            }
            totalCount += item.count;
        }

        // 金額と個数を表示
        const amountElement = document.querySelectorAll('.text_flex')[1]?.querySelector('p');
        if (amountElement) {
            amountElement.textContent = total.toLocaleString();
        }

        const countElement = document.querySelectorAll('.text_flex')[0]?.querySelector('p');
        if (countElement) {
            countElement.textContent = totalCount;
        }

        // 合計計算のあとにローカルストレージへ保存
        saveCartToLocalStorage();
    }

    // カート情報をローカルストレージに保存
    function saveCartToLocalStorage() {
        const cartData = {};
        for (const name in itemMap) {
            if (itemMap[name].count > 0) {
                cartData[name] = itemMap[name].count;
            }
        }
        localStorage.setItem('cartData', JSON.stringify(cartData));
    }

    // ===== モーダル開閉 =====
    document.querySelectorAll(".modal-toggle").forEach(btn => {
        btn.onclick = function () {
            const modalId = btn.getAttribute('data-modal');
            const modal = document.getElementById(modalId);
            modal?.classList.add('show');
        };
    });

    document.querySelectorAll(".close-btn-top, .close-btn-bottom, .close-btn").forEach(btn => {
        btn.onclick = function () {
            const modal = btn.closest('.modal-outer');
            modal?.classList.remove('show');
        };
    });

    document.querySelectorAll('.modal-outer').forEach(outer => {
        outer.onclick = function (event) {
            if (!event.target.closest('.modal-inner')) {
                outer.classList.remove('show');
            }
        };
    });

    // ===== CSVから初期データ読み込み（Thymeleaf想定） =====
    if (typeof csvDataFromServer !== 'undefined' && csvDataFromServer.trim() !== '') {

        console.log(csvDataFromServer);

        let rawData = csvDataFromServer.trim();

        // 先頭と末尾が " で囲まれていたら除去
        if (rawData.startsWith('"') && rawData.endsWith('"')) {
            rawData = rawData.slice(1, -1);
        }

        // エスケープされた \n を実際の改行に変換
        rawData = rawData.replace(/\\n/g, '\n');
        console.log(rawData);//読み込めてるかのテスト用
        rawData.split('\n').forEach(line => {
            const [name, countStr] = line.split(',');
            const count = parseInt(countStr);
            if (name && !isNaN(count) && itemMap[name.trim()]) {
                itemMap[name.trim()].count = count;
                updateDisplay(itemMap[name.trim()]);
            }
        });
        updateTotalAmount();
    }


    // ===== フォーム送信時 hiddenフィールド追加 =====
    const form = document.getElementById('sendForm');
    const hiddenFields = document.getElementById('hiddenFields');

    if (form && hiddenFields) {
        form.addEventListener('submit', function () {
            hiddenFields.innerHTML = '';
            let index = 0;
            for (const name in itemMap) {
                const item = itemMap[name];

                const nameInput = document.createElement('input');
                nameInput.type = 'hidden';
                nameInput.name = `items[${index}].name`;
                nameInput.value = name;

                const countInput = document.createElement('input');
                countInput.type = 'hidden';
                countInput.name = `items[${index}].count`;
                countInput.value = item.count;

                hiddenFields.appendChild(nameInput);
                hiddenFields.appendChild(countInput);
                index++;

            }
        });
    }


    // ===== カートリセット処理 =====
    const resetButton = document.querySelector('button.reset');
    if (resetButton) {
        resetButton.addEventListener('click', function () {
            for (const name in itemMap) {
                itemMap[name].count = 0;
                updateDisplay(itemMap[name]);
            }
            updateTotalAmount();
        });
    }

    // ===== purchasePage.html用 カート表示処理 =====
    if (document.querySelector('.purchase_item')) {
        const cartData = JSON.parse(localStorage.getItem('cartData') || '{}');

        const itemElements = document.querySelectorAll('.purchase_item');
        itemElements.forEach(item => {
            const title = item.querySelector('h')?.textContent?.trim();
            if (title && cartData[title] && item.querySelector('.ko')) {
                item.querySelector('.ko').textContent = cartData[title] + '個';
                item.querySelector('.ko').style.display = 'inline';
            }
        });
    }

    // ===== purchasePage.html用 カート表示処理 =====
    if (document.querySelector('.purchase_item')) {
        const cartData = JSON.parse(localStorage.getItem('cartData') || '{}');

        const reverseProductNameMap = {
            "ショートケーキ(ホール)": "ショートケーキ(H)"
        };

        const itemElements = document.querySelectorAll('.purchase_item');
        itemElements.forEach(item => {
            const title = item.querySelector('h3')?.textContent?.trim();
            const storedName = reverseProductNameMap[title] || title;

            const count = cartData[storedName] || 0;

            if (count > 0 && item.querySelector('.ko')) {
                item.querySelector('.ko').textContent = count + '個';
                item.querySelector('.ko').style.display = 'inline';
            } else {
                item.style.display = 'none';
            }
        });
    }

    // ===== purchasePage.html用 合計個数・金額表示処理 =====
    const totalCountElement = document.querySelectorAll('.purchase_text_flex')[0]?.querySelector('.p1');
    const totalAmountElement = document.querySelectorAll('.purchase_text_flex')[1]?.querySelector('.p1');

    if (totalCountElement && totalAmountElement) {
        const cartData = JSON.parse(localStorage.getItem('cartData') || '{}');
        const priceMap = {
            "ミルクレープ": 600,
            "ショートケーキ(H)": 3500,
            "アニバーサリーケーキ": 1200,
            "クッキー": 400,
            "季節のキャンディー": 500,
            "モンブラン": 800
        };

        // 表示名 → 保存名（逆変換）
        const reverseProductNameMap = {
            "ショートケーキ(ホール)": "ショートケーキ(H)"
        };

        let totalCount = 0;
        let totalAmount = 0;

        for (const title in cartData) {
            const count = cartData[title];
            totalCount += count;
            totalAmount += (priceMap[title] || 0) * count;
        }

        totalCountElement.textContent = totalCount;
        totalAmountElement.textContent = '¥' + totalAmount.toLocaleString();
        // 「個」「円」の表示
        const unitLabels = document.querySelectorAll('.purchase_text_flex .ko');
        unitLabels.forEach(unit => {
            unit.style.display = 'inline';
        });
    }

    // ===== purchasePage.html用 カート内が空の場合の処理 =====
    window.addEventListener('DOMContentLoaded', () => {
        const koElements = document.querySelectorAll('.purchase_item .ko');
        let hasItems = false;

        koElements.forEach(el => {
            const text = el.textContent.trim();
            if (text !== '' && text !== '個') {
                hasItems = true;
            }
        });

        if (!hasItems) {
            const purchaseSection = document.querySelector('.purchase');
            if (purchaseSection) {
                // <section>の中身を空にする
                purchaseSection.innerHTML = '';

                // メッセージ用のp要素を作成
                const emptyMsg = document.createElement('p');
                emptyMsg.textContent = '現在カート内に商品は入っていません';
                emptyMsg.style.textAlign = 'center';
                emptyMsg.style.fontWeight = 'bold';
                emptyMsg.style.color = '#c00';
                emptyMsg.style.marginTop = '32px';

                // <section>にメッセージを追加
                purchaseSection.appendChild(emptyMsg);
            }
        }
    });
});