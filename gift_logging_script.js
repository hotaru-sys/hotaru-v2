/**
 * hotaru お裾分け（ギフト）ログ記録用スクリプト (Supabase版)
 * index_trial.html / index_trial_v2.html 等に追加して使用します。
 */

async function setupGiftLogging() {
    const urlParams = new URLSearchParams(window.location.search);
    const ref = urlParams.get('ref');
    const from = urlParams.get('from');

    // 1. 流入ログの記録 (アクセスされただけで記録)
    if (ref) {
        console.log('Referral detected:', ref);
        
        // GA4への記録
        if (typeof gtag === 'function') {
            gtag('event', 'referral_visit', {
                'source': ref,
                'from_user_id': from || 'anonymous'
            });
        }

        // Supabaseの設定
        const SUPABASE_URL = 'https://ubnqbpsbtmdplmlivxbj.supabase.co';
        const SUPABASE_ANON_KEY = 'sb_publishable_b53Z6uC6UPLMbyy20-fWXg_FU_4uWEw';

        if (typeof supabase !== 'undefined') {
            const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

            // referral_logs テーブルにアクセスを記録
            await supabaseClient
                .from('referral_logs')
                .insert([
                    { referral_source: ref }
                ]);

            // 2. ユーザー登録（紐付け）の記録
            // ログイン中のユーザーがいれば、そのユーザーの referred_by を更新
            const sbAuthToken = localStorage.getItem('sb-ubnqbpsbtmdplmlivxbj-auth-token');
            let userId = null;
            if (sbAuthToken) {
                try { userId = JSON.parse(sbAuthToken).user?.id; } catch (e) { }
            }

            if (userId && ref === 'gift') {
                // 紹介元（from）があればUUIDとして記録を試みる
                const updateData = { referral_source: 'gift' };
                if (from && from.length === 36) { // UUID形式チェック
                    updateData.referred_by = from;
                }

                await supabaseClient
                    .from('users')
                    .update(updateData)
                    .eq('id', userId);
                
                console.log("User referral link updated");
            }
        }
    }
}

// 読み込み時に実行
window.addEventListener('DOMContentLoaded', setupGiftLogging);
