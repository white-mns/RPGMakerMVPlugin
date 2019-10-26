//=============================================================================
// ESRT_MessageClickableWaitMode.js
// ----------------------------------------------------------------------------
// Copyright (c) 2019 白
// This software is released under the MIT License.
// http://opensource.org/licenses/mit-license.php
// ----------------------------------------------------------------------------
// Changelog
// 2019/10/26 ver 1.0.0   初版
// ----------------------------------------------------------------------------
// [HP]     : https://mn-s.net/   (全年齢)
//            https://esora-t.jp/  (成人向)
// [Twitter]: https://twitter.com/white_mns  (全年齢)
//            https://twitter.com/white_esorat  (成人向)
// [GitHub] : https://github.com/white-mns
//=============================================================================

/*:
 * @plugindesc 「文章の表示」のウェイト中に、入力があればウェイトを無視してテキストを進めることができるようにします。
 * @author 白
 *
 * @help 2019/10/26  ver 1.0.0 
 * 「文章の表示」のウェイト中（『\.』：1/4秒待つ、『\|』：1秒待つ）、入力があればウェイトを無視してテキストを進めることができるようにします。
 *   
 *   制御文字     命令
 *   \CW         その文章中だけ、ウェイト中に入力があると以降のウェイトを無視します。
 *   \SCW        ウェイトを無視する状態を解除します
 *   \PCW        現在のマップにいる間、ウェイト中に入力があると以降のウェイトを無視する状態にします
 *   \SPCW       \PCWの状態を解除します。
 *   \PA         その文章中だけ、ウェイト中にも入力待機中の矢印を表示させます。（上記命令と組み合わせて、プレイヤーに操作できることを明示します）
 *   \SPA        ウェイト中の矢印表示を解除します。
 *   \PPA        現在のマップにいる間、ウェイト中にも入力待機中の矢印を表示させる状態にします。
 *   \SPPA       \PPAの状態を解除します。
 *
 *   例） ステージクリア！！\CW\PA\|\|\|\|\|\^
 *
 * 　　　（クリックしないと5秒待ってメッセージウィンドウが閉じて、
 *        クリックするとすぐにウィンドウが閉じる）
 *
 *   例） ステージクリア！！\|\CW\PA\|\|\|\|\|\^
 *
 * 　　　（一秒だけ普通のウェイトで、残りはクリックで飛ばせるウェイトにする。
 *        ボタン押しっぱなしでもすぐには読み飛ばされず、かつプレイヤーは長いウェイトを任意で飛ばせます）
 *
 *
 *
 *  利用規約：
 *   このプラグインはMITライセンスを採用しています。
 *   作者に無断で改変、再配布が可能です。
 *   改変したプラグインをMITライセンスにしなくても問題ありません。
 *   商用、年齢制限のあるゲームにこのプラグインを使用しても問題ありません。
 * 
 *   このソフトウェアの著作権表示と、MITライセンスの全文へのリンクを、
 *   ソースコードの中や、ソースコードに同梱したライセンス表示用の別ファイルなどに掲載してください。
 *   (このファイルのここより上の部分に著作権表示をしているので、その文章を削除しなければ
 *    このプラグインを使った時点で条件を満たします。他に何もしなくてOKです)
 */

var Esrt = Esrt || {};

(function() {
    'use strict';
	var pluginName    = 'ESRT_MessageClickableWaitMode';

    //=============================================================================
    // パラメータの取得と整形
    //=============================================================================
    var parameters = PluginManager.parameters(pluginName);
    
    //=============================================================================
    // Window_Message
    //  クリック可能ウェイトモードの処理を追加
    //=============================================================================
    var _Window_Message_initialize      = Window_Message.prototype.initialize;
    Window_Message.prototype.initialize = function() {
        _Window_Message_initialize.apply(this, arguments);
        
        this._clicableWait = false;
        this._pauseArrow = false;
        this._waitSkip = false;
        this._permanentClicableWait = false;
        this._permanentPauseArrow = false;
    };
    var _Window_Message_onEndOfText      = Window_Message.prototype.onEndOfText;
    Window_Message.prototype.onEndOfText = function() {
        _Window_Message_onEndOfText.apply(this, arguments);
        
        this._clicableWait = (!this._permanentClicableWait) ? false : this._clicableWait;
        this._pauseArrow   = (!this._permanentPauseArrow)   ? false : this._pauseArrow;
        this._waitSkip = false;
    };
    
    var _Window_Message_updateWait      = Window_Message.prototype.updateWait;
    Window_Message.prototype.updateWait = function() {
        if (this._waitSkip) {
            this._waitCount = 0;
        }
        
        if (this._clicableWait && this._waitCount > 0) {
            this._waitCount--;
            if (this.isTriggered()) {
                Input.update();
                this._waitCount = 0;
                this._waitSkip = true;
                this.pause = false;
                if (!this._textState) {
                    this.terminateMessage();
                }
            }
            return true;
        }
        
        return _Window_Message_updateWait.apply(this, arguments);
    };
    
    var _Window_Message_updatePauseSign = Window_Message.prototype._updatePauseSign;
    Window_Message.prototype._updatePauseSign = function() {
        _Window_Message_updatePauseSign.apply(this, arguments);
        
        var sprite = this._windowPauseSignSprite;
        
        if (this._pauseArrow) {
           sprite.alpha = 1;
        }
    };
    
    var _Window_Message_processEscapeCharacter = Window_Message.prototype.processEscapeCharacter;
    Window_Message.prototype.processEscapeCharacter = function(code, textState) {
        _Window_Message_processEscapeCharacter.apply(this, arguments);
        switch (code) {
        case 'CW': // clicable wait
            this._clicableWait = true;
            break;
            
        case 'SCW': // stop clicable wait
            this._clicableWait = false;
            this._waitSkip = false;
            break;
            
        case 'PCW': // permanent clicable wait
            this._clicableWait = true;
            this._permanentClicableWait = true;
            break;
            
        case 'SPCW': // stop permanent clicable wait
            this._permanentClicableWait = false;
            break;
            
        case 'PA': // pause arrow
            this._pauseArrow = true;
            break;
            
        case 'SPA': // stop pause arrow
            this._pauseArrow = false;
            break;
            
        case 'PPA': // permanent pause arrow
            this._pauseArrow = true;
            this._permanentPauseArrow = true;
            break;
            
        case 'SPPA': // stop permanent pause arrow
            this._permanentPauseArrow = false;
            break;
        }
    };
}());
