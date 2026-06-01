import os
import re
from fpdf import FPDF

class PDF(FPDF):
    def __init__(self, title_text="SEOVIP"):
        super().__init__()
        self.title_text = title_text

    def header(self):
        # We can add a clean header
        self.set_font("DejaVu", "B", 8)
        self.set_text_color(128, 128, 128)
        
        # Save X and Y to print left and right on the same line
        x, y = self.get_x(), self.get_y()
        self.cell(0, 10, self.title_text, align="L")
        self.set_xy(x, y)
        self.cell(0, 10, "Tài liệu lưu hành nội bộ", align="R")
        self.ln(10)
        # Draw a thin grey line
        self.set_draw_color(200, 200, 200)
        self.set_line_width(0.2)
        self.line(self.l_margin, self.get_y(), self.w - self.r_margin, self.get_y())
        self.ln(5)

    def footer(self):
        self.set_y(-15)
        self.set_font("DejaVu", "", 8)
        self.set_text_color(128, 128, 128)
        # Page number
        self.cell(0, 10, f"Trang {self.page_no()}/{{nb}}", align="C")

def convert_txt_to_pdf(txt_path, pdf_path, title):
    pdf = PDF(title_text=title)
    pdf.alias_nb_pages()
    
    # Register DejaVuSans fonts (which support Vietnamese Unicode)
    font_path = "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"
    font_bold_path = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
    
    pdf.add_font("DejaVu", style="", fname=font_path)
    pdf.add_font("DejaVu", style="B", fname=font_bold_path)
    
    pdf.set_margins(15, 15, 15)
    pdf.add_page()
    
    with open(txt_path, "r", encoding="utf-8") as f:
        lines = f.readlines()
        
    in_header_block = False
    
    for i, line in enumerate(lines):
        line_str = line.rstrip("\n")
        
        # Detect big title blocks surrounded by equals (e.g. ===)
        if re.match(r"^={5,}$", line_str):
            in_header_block = not in_header_block
            continue
            
        if in_header_block:
            # Render title in bold and larger size
            pdf.set_font("DejaVu", "B", 14)
            pdf.set_text_color(26, 54, 93) # Deep Blue
            pdf.multi_cell(0, 8, line_str.strip(), align="C", new_x="LMARGIN", new_y="NEXT")
            pdf.ln(2)
            continue
            
        # Detect roman numeral headings like I., II., III.
        if re.match(r"^(I|II|III|IV|V|VI|VII|VIII|IX|X|XI|XII)\.\s", line_str):
            pdf.ln(4)
            pdf.set_font("DejaVu", "B", 12)
            pdf.set_text_color(43, 108, 176) # Lighter Blue
            pdf.multi_cell(0, 7, line_str, new_x="LMARGIN", new_y="NEXT")
            pdf.ln(2)
            continue
            
        # Detect numbered sections like 1., 2., 3.
        if re.match(r"^\s*\d+\.\s", line_str):
            pdf.set_font("DejaVu", "B", 10.5)
            pdf.set_text_color(45, 55, 72) # Charcoal
            pdf.multi_cell(0, 6, line_str, new_x="LMARGIN", new_y="NEXT")
            continue

        # Regular bullet points or lines
        pdf.set_font("DejaVu", "", 10)
        pdf.set_text_color(45, 55, 72) # Charcoal
        
        # If it's a bold-looking line, make it bold
        if line_str.startswith("* ") or line_str.startswith("  * "):
            # Bold bullet headers
            parts = line_str.split(":", 1)
            if len(parts) == 2 and len(parts[0]) < 60:
                pdf.set_font("DejaVu", "B", 10)
                pdf.write(6, parts[0] + ":")
                pdf.set_font("DejaVu", "", 10)
                pdf.multi_cell(0, 6, parts[1], new_x="LMARGIN", new_y="NEXT")
            else:
                pdf.multi_cell(0, 6, line_str, new_x="LMARGIN", new_y="NEXT")
        else:
            pdf.multi_cell(0, 6, line_str, new_x="LMARGIN", new_y="NEXT")
            
    pdf.output(pdf_path)
    print(f"Successfully converted {txt_path} to {pdf_path}")

if __name__ == "__main__":
    base_dir = "/home/dathoang022004/All_project/VKU/ThucTapTotNghiep/info"
    
    files_to_convert = [
        ("info.txt", "info.pdf", "SEOVIP - Thông Tin Công Ty & Dịch Vụ"),
        ("price.txt", "price.pdf", "SEOVIP - Bảng Giá Dịch Vụ & Khóa Học"),
        ("other.txt", "other.pdf", "SEOVIP - Tuyển Dụng & Các Chính Sách"),
    ]
    
    for txt_file, pdf_file, title in files_to_convert:
        txt_p = os.path.join(base_dir, txt_file)
        pdf_p = os.path.join(base_dir, pdf_file)
        convert_txt_to_pdf(txt_p, pdf_p, title)
