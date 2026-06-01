param (
    [string]$InputPath,
    [string]$OutputPath,
    [string]$HeaderTitle = "Exam Paper",
    [string]$FooterTitle = "Page 1",
    [string]$BannerSubtitle = "AI Aesthetic Typesetting"
)

# 1. Title Banner (1x1 table, deep blue background with white text)
function Add-TitleBanner($doc, $title, $subtitle) {
    $para = $doc.Paragraphs.Add()
    $table = $doc.Tables.Add($para.Range, 1, 1)
    $table.Borders.InsideLineStyle = 0
    $table.Borders.OutsideLineStyle = 0
    
    $cell = $table.Cell(1, 1)
    # BGR Deep Blue (Red=26, Green=54, Blue=93 => BGR = 6108698)
    $cell.Shading.BackgroundPatternColor = 6108698
    $cell.TopPadding = 14
    $cell.BottomPadding = 14
    $cell.LeftPadding = 12
    $cell.RightPadding = 12
    
    $range = $cell.Range
    $range.Text = $title + "`r" + $subtitle
    
    # Title
    $p1 = $range.Paragraphs.Item(1)
    $p1.Range.Font.Name = "Microsoft JhengHei"
    $p1.Range.Font.Size = 15
    $p1.Range.Font.Bold = $true
    $p1.Range.Font.Color = 16777215 # White
    $p1.Alignment = 1 # Center
    $p1.Format.SpaceAfter = 6
    
    # Subtitle
    $p2 = $range.Paragraphs.Item(2)
    $p2.Range.Font.Name = "Microsoft JhengHei"
    $p2.Range.Font.Size = 9.5
    $p2.Range.Font.Bold = $false
    $p2.Range.Font.Color = 16777215 # White
    $p2.Alignment = 1 # Center
    $p2.Format.SpaceAfter = 0
    
    $doc.Paragraphs.Add()
}

# 2. Passage Box (1x1 table, cream background, Kai font)
function Add-PassageBox($doc, $textLines) {
    $para = $doc.Paragraphs.Add()
    $table = $doc.Tables.Add($para.Range, 1, 1)
    
    $table.Borders.InsideLineStyle = 0
    $table.Borders.OutsideLineStyle = 1 # Solid
    $table.Borders.OutsideLineWidth = 8 # 1 pt
    $table.Borders.OutsideColor = 12632256 # Gray
    
    $cell = $table.Cell(1, 1)
    # BGR Cream Light Yellow (Red=253, Green=252, Blue=248 => BGR = 16317693)
    $cell.Shading.BackgroundPatternColor = 16317693
    $cell.TopPadding = 10
    $cell.BottomPadding = 10
    $cell.LeftPadding = 12
    $cell.RightPadding = 12
    
    $range = $cell.Range
    $fullText = ""
    foreach ($line in $textLines) {
        $fullText += $line + "`r`n"
    }
    $range.Text = $fullText.Trim()
    
    # Format paragraphs inside passage box to Kai font
    $idx = 1
    $pCount = $range.Paragraphs.Count
    while ($idx -le $pCount) {
        $p = $range.Paragraphs.Item($idx)
        $p.Range.Font.Name = "DFKai-SB" # Kai Font
        $p.Range.Font.Size = 10
        $p.Range.Font.Bold = $false
        $p.Range.Font.Color = 2105376 # Dark Gray
        $p.Format.LeftIndent = 0
        $p.Format.SpaceAfter = 4
        $p.Format.LineSpacing = 14
        $idx++
    }
    
    $doc.Paragraphs.Add()
}

# 3. Data Table (multi-row table, slate gray header with white text, zebra stripes)
function Add-DataTable($doc, $headers, $dataRows) {
    $para = $doc.Paragraphs.Add()
    $numRows = $dataRows.Count + 1
    $numCols = $headers.Count
    
    $table = $doc.Tables.Add($para.Range, $numRows, $numCols)
    
    # Table borders
    $table.Borders.InsideLineStyle = 1
    $table.Borders.InsideLineWidth = 4
    $table.Borders.InsideColor = 14211288
    $table.Borders.OutsideLineStyle = 1
    $table.Borders.OutsideLineWidth = 8
    $table.Borders.OutsideColor = 12632256
    
    # Table Header
    $c = 1
    while ($c -le $numCols) {
        $cell = $table.Cell(1, $c)
        $cell.Range.Text = $headers[$c - 1]
        $cell.Range.Font.Name = "Microsoft JhengHei"
        $cell.Range.Font.Size = 9.5
        $cell.Range.Font.Bold = $true
        $cell.Range.Font.Color = 16777215 # White
        # BGR Slate Gray (Red=74, Green=85, Blue=104 => BGR = 6837578)
        $cell.Shading.BackgroundPatternColor = 6837578
        $cell.Range.ParagraphFormat.Alignment = 1 # Center
        $cell.TopPadding = 6
        $cell.BottomPadding = 6
        $cell.LeftPadding = 6
        $cell.RightPadding = 6
        $c++
    }
    
    # Data Rows
    $r = 2
    while ($r -le $numRows) {
        $rowData = $dataRows[$r - 2]
        
        # Zebra pattern background BGR
        $bgColor = 16777215 # White
        if ($r % 2 -eq 1) {
            $bgColor = 16119285 # Light Gray
        }
        
        $c = 1
        while ($c -le $numCols) {
            $cell = $table.Cell($r, $c)
            if ($c -le $rowData.Count) {
                $cell.Range.Text = $rowData[$c - 1]
            } else {
                $cell.Range.Text = ""
            }
            $cell.Range.Font.Name = "Microsoft JhengHei"
            $cell.Range.Font.Size = 9
            $cell.Range.Font.Bold = $false
            $cell.Range.Font.Color = 0
            $cell.Shading.BackgroundPatternColor = $bgColor
            
            # Text alignment
            if ($c -eq 1) {
                $cell.Range.ParagraphFormat.Alignment = 0 # Left
            } else {
                $cell.Range.ParagraphFormat.Alignment = 1 # Center
            }
            
            $cell.TopPadding = 5
            $cell.BottomPadding = 5
            $cell.LeftPadding = 6
            $cell.RightPadding = 6
            $c++
        }
        $r++
    }
    
    $doc.Paragraphs.Add()
}

# --- Main Logic with Try-Catch Block ---
try {
    if (-not (Test-Path $InputPath)) {
        Write-Error "Input file not found"
        exit 1
    }

    Write-Host "Starting Microsoft Word COM service..."
    $word = New-Object -ComObject Word.Application
    $word.Visible = $false
    $doc = $word.Documents.Add()
    $selection = $word.Selection

    Write-Host "Setting margins..."
    $doc.PageSetup.TopMargin = 54
    $doc.PageSetup.BottomMargin = 54
    $doc.PageSetup.LeftMargin = 54
    $doc.PageSetup.RightMargin = 54

    Write-Host "Setting headers and footers..."
    $section = $doc.Sections.Item(1)
    
    # Header
    $header = $section.Headers.Item(1)
    $header.Range.Text = $HeaderTitle
    $header.Range.Font.Name = "Microsoft JhengHei"
    $header.Range.Font.Size = 9
    $header.Range.Font.Color = 8421504 # Gray
    $header.Range.ParagraphFormat.Alignment = 2 # Right

    # Footer
    $footer = $section.Footers.Item(1)
    $footer.Range.Text = $FooterTitle
    $footer.Range.Font.Name = "Microsoft JhengHei"
    $footer.Range.Font.Size = 9
    $footer.Range.Font.Color = 8421504
    $footer.Range.ParagraphFormat.Alignment = 1 # Center

    # --- Markdown Compiler Core using Flat State Machine ---
    $lines = Get-Content -Path $InputPath -Encoding utf8
    $numLines = $lines.Count
    $i = 0
    $hasBanner = $false

    # Buffer lists for state machine
    $tableLines = New-Object System.Collections.Generic.List[System.String]
    $quoteLines = New-Object System.Collections.Generic.List[System.String]

    while ($i -lt $numLines) {
        $line = $lines[$i]
        $trimmed = $line.Trim()
        
        $isTableLine = $trimmed.StartsWith("|") -and $trimmed.EndsWith("|")
        $isQuoteLine = $trimmed.StartsWith(">")

        # Flush Table if current line is not table and buffer is not empty
        if (-not $isTableLine -and $tableLines.Count -gt 0) {
            if ($tableLines.Count -ge 3) {
                $headerLine = $tableLines[0]
                $headers = New-Object System.Collections.Generic.List[System.String]
                $headerCells = $headerLine -split '\|'
                foreach ($cell in $headerCells) {
                    $cTrim = $cell.Trim()
                    if ($cTrim -ne "") {
                        $headers.Add($cTrim)
                    }
                }
                
                $dataRows = New-Object System.Collections.Generic.List[System.Object]
                $k = 2
                $tCount = $tableLines.Count
                while ($k -lt $tCount) {
                    $rowCells = New-Object System.Collections.Generic.List[System.String]
                    $rowItems = $tableLines[$k] -split '\|'
                    foreach ($cell in $rowItems) {
                        $cTrim = $cell.Trim() -replace '\*\*([^*]+)\*\*', '$1'
                        if ($cell -ne $rowItems[0] -and $cell -ne $rowItems[-1]) {
                            $rowCells.Add($cTrim)
                        }
                    }
                    $dataRows.Add($rowCells)
                    $k++
                }
                Add-DataTable $doc $headers $dataRows
            }
            $tableLines.Clear()
        }

        # Flush Blockquote if current line is not quote and buffer is not empty
        if (-not $isQuoteLine -and $quoteLines.Count -gt 0) {
            Add-PassageBox $doc $quoteLines
            $quoteLines.Clear()
        }

        # Handle table line state
        if ($isTableLine) {
            $tableLines.Add($trimmed)
            $i++
            continue
        }

        # Handle quote line state
        if ($isQuoteLine) {
            $cleanLine = $trimmed.Substring(1).Trim() -replace '\*\*([^*]+)\*\*', '$1'
            $quoteLines.Add($cleanLine)
            $i++
            continue
        }

        # Skip empty lines
        if ($trimmed -eq "") {
            $i++
            continue
        }
        
        # Heading 1 (Large Title)
        if ($trimmed.StartsWith("# ")) {
            $text = $trimmed.Substring(2).Trim() -replace '\*\*([^*]+)\*\*', '$1'
            if (-not $hasBanner) {
                Add-TitleBanner $doc $text $BannerSubtitle
                $hasBanner = $true
            } else {
                $para = $doc.Paragraphs.Add()
                $para.Range.Text = $text
                $para.Range.Font.Name = "Microsoft JhengHei"
                $para.Range.Font.Size = 13
                $para.Range.Font.Bold = $true
                $para.Range.Font.Color = 6108698
                $para.Format.SpaceBefore = 14
                $para.Format.SpaceAfter = 6
                $para.Range.InsertParagraphAfter()
            }
            $i++
            continue
        }
        
        # Heading 2 (Medium Title)
        if ($trimmed.StartsWith("## ")) {
            $text = $trimmed.Substring(3).Trim() -replace '\*\*([^*]+)\*\*', '$1'
            $para = $doc.Paragraphs.Add()
            $para.Range.Text = $text
            $para.Range.Font.Name = "Microsoft JhengHei"
            $para.Range.Font.Size = 11.5
            $para.Range.Font.Bold = $true
            $para.Range.Font.Color = 6837578
            $para.Format.SpaceBefore = 10
            $para.Format.SpaceAfter = 4
            $para.Range.InsertParagraphAfter()
            $i++
            continue
        }
        
        # Heading 3 (Small Title)
        if ($trimmed.StartsWith("### ")) {
            $text = $trimmed.Substring(4).Trim() -replace '\*\*([^*]+)\*\*', '$1'
            $para = $doc.Paragraphs.Add()
            $para.Range.Text = $text
            $para.Range.Font.Name = "Microsoft JhengHei"
            $para.Range.Font.Size = 10.5
            $para.Range.Font.Bold = $true
            $para.Range.Font.Color = 6108698
            $para.Format.SpaceBefore = 8
            $para.Format.SpaceAfter = 3
            $para.Range.InsertParagraphAfter()
            $i++
            continue
        }
        
        # Bullet list item
        if ($trimmed.StartsWith("- ") -or $trimmed.StartsWith("* ")) {
            $text = $trimmed.Substring(2).Trim() -replace '\*\*([^*]+)\*\*', '$1'
            $para = $doc.Paragraphs.Add()
            $para.Range.Text = "o " + $text
            $para.Range.Font.Name = "Microsoft JhengHei"
            $para.Range.Font.Size = 10
            $para.Range.Font.Bold = $false
            $para.Format.LeftIndent = 20
            $para.Format.SpaceAfter = 3
            $para.Range.InsertParagraphAfter()
            $i++
            continue
        }
        
        # Body Paragraph (Questions, Options, Descriptions)
        $cleanText = $line -replace '\*\*([^*]+)\*\*', '$1'
        
        $para = $doc.Paragraphs.Add()
        $para.Range.Text = $cleanText
        $para.Range.Font.Name = "Microsoft JhengHei"
        $para.Range.Font.Size = 10
        
        # Smart formatting:
        # A. Aligned options - indented (A), (B), (C), (D) or A. (using Unicode ranges for fullwidth parens \uFF08 and \uFF09)
        if ($trimmed -match '^\s*[\(\uFF08][A-Da-d][\)\uFF09]' -or $trimmed -match '^\s*[A-Da-d]\.') {
            $para.Format.LeftIndent = 20
            $para.Range.Font.Bold = $false
            $para.Format.SpaceAfter = 2
        }
        # B. Auto-bolded questions (starting with digits followed by dot or fullwidth dot \u3001)
        elseif ($trimmed -match '^\s*\d+[\.\u3001]') {
            $para.Format.LeftIndent = 0
            $para.Range.Font.Bold = $true
            $para.Format.SpaceAfter = 4
        }
        # C. Normal text
        else {
            $para.Format.LeftIndent = 0
            $para.Range.Font.Bold = $false
            $para.Format.SpaceAfter = 4
        }
        
        $para.Range.InsertParagraphAfter()
        $i++
    }

    # Flush remaining table or quotes at the end of file
    if ($tableLines.Count -gt 0) {
        if ($tableLines.Count -ge 3) {
            $headerLine = $tableLines[0]
            $headers = New-Object System.Collections.Generic.List[System.String]
            $headerCells = $headerLine -split '\|'
            foreach ($cell in $headerCells) {
                $cTrim = $cell.Trim()
                if ($cTrim -ne "") {
                    $headers.Add($cTrim)
                }
            }
            
            $dataRows = New-Object System.Collections.Generic.List[System.Object]
            $k = 2
            $tCount = $tableLines.Count
            while ($k -lt $tCount) {
                $rowCells = New-Object System.Collections.Generic.List[System.String]
                $rowItems = $tableLines[$k] -split '\|'
                foreach ($cell in $rowItems) {
                    $cTrim = $cell.Trim() -replace '\*\*([^*]+)\*\*', '$1'
                    if ($cell -ne $rowItems[0] -and $cell -ne $rowItems[-1]) {
                        $rowCells.Add($cTrim)
                    }
                }
                $dataRows.Add($rowCells)
                $k++
            }
            Add-DataTable $doc $headers $dataRows
        }
    }

    if ($quoteLines.Count -gt 0) {
        Add-PassageBox $doc $quoteLines
    }

    # Save and close Word
    $doc.SaveAs([ref] $OutputPath)
    $doc.Close()
    $word.Quit()
    Write-Host "Success"
} catch {
    if ($doc) { $doc.Close() }
    if ($word) { $word.Quit() }
    Write-Error $_.Exception.Message
    exit 1
}
