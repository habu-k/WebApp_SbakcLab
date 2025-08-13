package com.example.demo.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;

import com.example.demo.dto.ItemDto;
import com.example.demo.dto.ItemListDto;
import com.example.demo.service.SnackLabService;

@Controller
public class SnackLabController {

	// Serviceクラスの呼び出し 堂前
	@Autowired
	SnackLabService service;

	// トップページ（index.html）を表示
	@GetMapping("/")
	public String index(Model model) {

		//カート内データCSVファイルを全取得
		List<ItemDto> list = service.getAllInCart();

		//CSVファイルをJavaScriptで使える形に変換
		String escapedCsv = service.getCsvFileForJs(list);

		//変換したデータを渡す
		model.addAttribute("snacks",escapedCsv);

		//確認用
		System.out.println(escapedCsv);

		return "index"; // templates/index.html を表示
	}


	// purchasePage.htmlを表示、CSVへの書き込み
	@PostMapping("/purchasePage")
	public String purchasePage(@ModelAttribute("items") ItemListDto itemListDto) {

		//受け取ったデータをListに格納
		List<ItemDto> items = itemListDto.getItems();

		//受け取ったデータの確認用
		System.out.println(itemListDto.toString());

		//CSVへの書き込み
		service.writeAllInCart(items);

		return "purchasePage";
	}

	@Controller
	public class PurchaseController {

		@PostMapping("/submit")
		public String handleFormSubmit(
				@RequestParam String name,
				@RequestParam String email,
				@RequestParam String tel,
				@RequestParam String zipcode,
				@RequestParam String prefecture,
				@RequestParam String city,
				@RequestParam String address1,
				@RequestParam(required = false) String address2,
				@RequestParam(required = false, name = "address") String comment,
				Model model
				) {
			System.out.println("====== フォーム受信内容 ======");
			System.out.println("ご送付先名: " + name);
			System.out.println("メールアドレス: " + email);
			System.out.println("電話番号: " + tel);
			System.out.println("郵便番号: " + zipcode);
			System.out.println("都道府県: " + prefecture);
			System.out.println("市区町村: " + city);
			System.out.println("丁目番地: " + address1);
			System.out.println("建物号室: " + (address2 != null ? address2 : ""));
			System.out.println("コメント・備考: " + (comment != null ? comment : ""));
			System.out.println("===========================");
			
			//CSVの中身全削除
			service.clearCsvFile();

			// フォーム送信後に index.html を表示
			return "redirect:/"; // templates/index.html を表示
		}
	}

}

