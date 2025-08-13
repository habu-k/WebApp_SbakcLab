package com.example.demo.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * index.htmlからpurchasePage.htmlへデータを渡すために使うDTOクラス
 * 堂前
 */

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ItemDto {
	
	private String name;
    private int count;

}
