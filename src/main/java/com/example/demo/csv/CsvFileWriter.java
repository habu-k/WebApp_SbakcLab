package com.example.demo.csv;

import java.io.BufferedWriter;
import java.io.FileNotFoundException;
import java.io.FileWriter;
import java.io.IOException;
import java.util.List;

import org.springframework.stereotype.Component;

import com.example.demo.dto.ItemDto;

@Component
public class CsvFileWriter {

	private final String filepath = "inCart.csv";

	//カート内の商品全書き出し
	public  void csvWriter(List<ItemDto> list) {

		try(BufferedWriter bw = new BufferedWriter(new FileWriter(filepath))){

			bw.write("#商品名,個数");
			bw.newLine();
			
			for(ItemDto snack : list) {

				bw.write(snack.getName() + "," + snack.getCount());
				bw.newLine();

			}

		} catch (FileNotFoundException e) {
			// TODO 自動生成された catch ブロック
			e.printStackTrace();
		} catch (IOException e) {
			// TODO 自動生成された catch ブロック
			e.printStackTrace();
		}

	}

}
