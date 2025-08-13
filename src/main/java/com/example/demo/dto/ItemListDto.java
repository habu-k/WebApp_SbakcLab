package com.example.demo.dto;

import java.util.List;

import lombok.Data;

/**
 * index.htmlからpurchasePage.htmlへデータを渡すために使うDTOクラス
 * List<ItemDto>として管理
 * 堂前
 */

@Data
public class ItemListDto {
	
	 private List<ItemDto> items;

}
